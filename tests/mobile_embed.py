"""Phone-sized Chromium UI regression tests using inline standalone edition.

This intentionally works even when navigation to localhost is blocked by browser policy.
It tests DOM/gameplay rendering, not HTTP, service-worker installation, or real Android.
"""
import asyncio
import json
from pathlib import Path
from playwright.async_api import async_playwright

ROOT=Path(__file__).resolve().parents[1]
HTML=(ROOT/'play.html').read_text(encoding='utf-8')

async def new_page(browser, width, height, initial=None):
    page=await browser.new_page(viewport={'width':width,'height':height},
          device_scale_factor=2.75 if width<600 else 1, is_mobile=width<600, has_touch=width<600)
    # about:blank has an opaque origin. A test-only in-memory storage imitates localStorage.
    await page.evaluate('''(entries) => {
        const kv = {...entries};
        Object.defineProperty(window, 'localStorage', {configurable:true,value:{
          getItem: k => Object.hasOwn(kv,k) ? kv[k] : null,
          setItem: (k,v) => { kv[k] = String(v); },
          removeItem: k => { delete kv[k]; }
        }});
    }''',initial or {})
    errors=[]
    page.on('pageerror', lambda err: errors.append(str(err)))
    await page.set_content(HTML,wait_until='domcontentloaded')
    return page,errors

async def run():
  checks=[]
  async with async_playwright() as pw:
    browser=await pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',
                 args=['--no-sandbox','--disable-dev-shm-usage'])
    for width,height,label in [(320,700,'small-android'),(390,844,'android'),(412,915,'large-android'),(1280,850,'desktop')]:
      page,errors=await new_page(browser,width,height)
      assert await page.locator('.start-headline').count()==1,label
      assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth'),f'{label} overflow on welcome'
      if label=='android':
        await page.locator('#playerName').fill('Launch QA')
        await page.locator('[data-act=bots][data-value="1"]').click()
      await page.locator('[data-act=start]').click()
      assert await page.locator('.tile').count()==40,label
      assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth'),f'{label} overflow in game'
      assert not errors,(label,errors)
      checks.append(f'{label} {width}x{height}: playable 40-space board with no horizontal overflow or JS errors')
      if label=='android':
        await page.screenshot(path=str(ROOT/'tests/android-verified.png'),full_page=True)
        await page.locator('[data-act=roll]').click()
        await page.wait_for_timeout(485)
        serialized=await page.evaluate("localStorage.getItem('blockclub.game.v1')")
        saved=json.loads(serialized)
        assert saved['diceTotal'] in range(2,13),'dice action did not execute'
        assert saved['players'][0]['name']=='Launch QA'
        await page.close()
        page,errors=await new_page(browser,width,height,{'blockclub.game.v1':serialized})
        assert await page.locator('.tile').count()==40
        reloaded=json.loads(await page.evaluate("localStorage.getItem('blockclub.game.v1')"))
        assert reloaded==saved,'simulated restart did not restore saved game'
        checks.append('Autosave after dice roll and restore from preserved browser storage on fresh app load')
        # Portfolio is interactive on a resumed game.
        await page.locator('[data-act=portfolio]').first.click()
        assert await page.locator('.detail-sheet').count()==1
        await page.locator('.detail-sheet [data-act=close]').click()
        assert await page.locator('.detail-sheet').count()==0
        checks.append('Portfolio modal opens and closes through touch UI')
        # Build an independent game with deterministic owners and test actual trade form.
        trade_state=await page.evaluate("""() => { const g=newGame({name:'QA',bots:1,mode:'classic'}); g.assets[1].owner=0;g.assets[3].owner=1;return JSON.stringify(g); }""")
        await page.close()
        page,errors=await new_page(browser,width,height,{'blockclub.game.v1':trade_state})
        await page.locator('[data-act=trade]').click()
        await page.locator('#giveTile').select_option('1')
        await page.locator('#takeTile').select_option('3')
        await page.locator('#giveCash').fill('500')
        await page.locator('#giveCash').dispatch_event('change')
        await page.locator('[data-act=propose]').click()
        result=json.loads(await page.evaluate("localStorage.getItem('blockclub.game.v1')"))
        assert (result['assets'][1]['owner'],result['assets'][3]['owner'])==(1,0),result['notice']
        assert (result['players'][0]['cash'],result['players'][1]['cash'])==(1000,2000)
        assert result['notice']['title']=='Deal done'
        assert not errors,errors
        checks.append('Property/cash trade succeeds end-to-end via mobile UI, balances and ownership correct')
        # Corrupted settings alone must not discard a perfectly valid saved game.
        serialized=await page.evaluate("localStorage.getItem('blockclub.game.v1')")
        await page.close()
        page,errors=await new_page(browser,width,height,{'blockclub.game.v1':serialized,'blockclub.settings.v1':'{broken json'})
        assert await page.locator('.tile').count()==40
        checks.append('Corrupted settings do not erase valid game save')
      await page.close()
    await browser.close()
  return checks

if __name__=='__main__':
  checks=asyncio.run(run())
  print(json.dumps({'passed':len(checks),'checks':checks},indent=2))
