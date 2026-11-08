"""Browser verification of a *local* nested-path PWA. Makes no external requests."""
import asyncio
import functools
import http.server
import json
import os
import threading
from contextlib import contextmanager
from pathlib import Path
from playwright.async_api import async_playwright

SITE = Path(__file__).resolve().parents[1]
ROOT = SITE.parent

@contextmanager
def server():
    class Handler(http.server.SimpleHTTPRequestHandler):
        extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map,
                          '.mjs': 'text/javascript', '.webmanifest': 'application/manifest+json',
                          '.svg': 'image/svg+xml'}
        def log_message(self, *_args):
            pass
    handler = functools.partial(Handler, directory=str(ROOT))
    httpd = http.server.ThreadingHTTPServer(('127.0.0.1', 0), handler)
    t = threading.Thread(target=httpd.serve_forever, daemon=True)
    t.start()
    try:
        yield f'http://127.0.0.1:{httpd.server_port}/{SITE.name}/'
    finally:
        httpd.shutdown()
        httpd.server_close()
        t.join(timeout=2)

async def run(base):
    checks = []
    async with async_playwright() as pw:
        browser_kwargs = {'headless': True}
        if os.environ.get('BLOCKCLUB_CHROME_PATH'):
            browser_kwargs['executable_path'] = os.environ['BLOCKCLUB_CHROME_PATH']
        if os.name == 'posix' and hasattr(os, 'geteuid') and os.geteuid() == 0:
            browser_kwargs['args'] = ['--no-sandbox']
        browser = await pw.chromium.launch(**browser_kwargs)
        for width,height,name in [(320,700,'small-phone'),(390,844,'android'),(412,915,'large-phone'),(1280,850,'desktop')]:
            context = await browser.new_context(viewport={'width':width,'height':height},
                        device_scale_factor=2.75 if name != 'desktop' else 1,
                        is_mobile=name!='desktop', has_touch=name!='desktop')
            page = await context.new_page()
            page_errors=[]
            page.on('pageerror', lambda e: page_errors.append(str(e)))
            r=await page.goto(base,wait_until='load')
            assert r.status == 200, (name, r.status)
            assert await page.locator('.start-headline').count() == 1, name
            assert await page.evaluate('document.documentElement.scrollWidth <= innerWidth'), f'{name} horizontal overflow on welcome'
            if name=='android':
                await page.locator('#playerName').fill('Launch QA')
                await page.locator('[data-act=bots][data-value="1"]').click()
            await page.locator('[data-act=start]').click()
            assert await page.locator('.tile').count() == 40, name
            assert await page.evaluate('document.documentElement.scrollWidth <= innerWidth'), f'{name} horizontal overflow in game'
            assert not page_errors,(name,page_errors)
            if name=='android':
                await page.screenshot(path=str(SITE/'tests/android-launch.png'),full_page=True)
                manifest = await page.evaluate("async () => (await (await fetch('./manifest.webmanifest')).json())")
                assert manifest['display']=='standalone' and manifest['start_url']=='./' and manifest['scope']=='./'
                assert {i['sizes'] for i in manifest['icons']}.issuperset({'192x192','512x512'})
                session=await context.new_cdp_session(page)
                info=await session.send('Page.getAppManifest')
                assert not info.get('errors'),f"Manifest validation: {info.get('errors')}"
                checks.append('Android-emulated manifest: valid, 192/512 icons, standalone display')
                # Verify clean saved-game load from reload and a real user roll.
                await page.locator('[data-act=roll]').click()
                await page.wait_for_timeout(480)
                saved_before=await page.evaluate("JSON.parse(localStorage.getItem('blockclub.game.v1'))")
                assert saved_before['turnCount']>=0 and saved_before['diceTotal']>=2, saved_before
                await page.reload(wait_until='load')
                saved_after=await page.evaluate("JSON.parse(localStorage.getItem('blockclub.game.v1'))")
                assert saved_before==saved_after, 'reload lost autosave state'
                assert await page.locator('.tile').count()==40
                checks.append('Android-emulated game saves after dice roll and restores identically after reload')
                # SW controls this page; cold offline restart must load CSS/JS/manifest without the network.
                await page.evaluate("async () => { await navigator.serviceWorker.ready; if(!navigator.serviceWorker.controller) await new Promise(r=>navigator.serviceWorker.addEventListener('controllerchange',r,{once:true})); }")
                await context.set_offline(True)
                await page.reload(wait_until='load')
                assert await page.locator('.tile').count()==40, 'offline reload lost app shell'
                assert (await page.evaluate("JSON.parse(localStorage.getItem('blockclub.game.v1'))"))==saved_before
                assert await page.evaluate('document.styleSheets.length>0'), 'offline CSS missing'
                await page.locator('[data-act=portfolio]').first.click()
                assert await page.locator('.detail-sheet').count()==1
                await page.locator('.detail-sheet [data-act=close]').click()
                await context.set_offline(False)
                checks.append('Fully offline reload, saved state, styling and modal interaction work under a nested URL')
                # No CSP bypass for dynamically inserted inline scripts.
                await page.evaluate("() => { const s=document.createElement('script'); s.textContent='window.__csp_probe = 1'; document.body.append(s); }")
                assert not await page.evaluate('Boolean(window.__csp_probe)'), 'inline script bypassed page CSP'
                checks.append('Hosted page CSP blocks injected inline JavaScript')
                # Test a fully populated trade in the browser, not only the rules engine.
                await page.evaluate("""async () => {
                    const {newGame} = await import('./engine.mjs');
                    const g = newGame({name:'QA',bots:1,mode:'classic'});
                    g.assets[1].owner=0;g.assets[3].owner=1;
                    localStorage.setItem('blockclub.game.v1',JSON.stringify(g));
                }""")
                await page.reload(wait_until='load')
                await page.locator('[data-act=trade]').click()
                await page.locator('#giveTile').select_option('1')
                await page.locator('#takeTile').select_option('3')
                await page.locator('#giveCash').fill('500')
                await page.locator('#giveCash').dispatch_event('change')
                await page.locator('[data-act=propose]').click()
                traded=await page.evaluate("JSON.parse(localStorage.getItem('blockclub.game.v1'))")
                assert traded['assets'][1]['owner']==1 and traded['assets'][3]['owner']==0, 'trade UI failed'
                assert traded['players'][0]['cash']==1000 and traded['players'][1]['cash']==2000, 'trade balances failed'
                checks.append('Interactive trade UI transfers selected properties/cash correctly')
            checks.append(f'{name} {width}x{height}: no overflow, starts game, board renders, no JS errors')
            await context.close()
        await browser.close()
    return checks

if __name__=='__main__':
    with server() as base:
        checks=asyncio.run(run(base))
    print(json.dumps({'passed':len(checks), 'checks':checks},indent=2))
