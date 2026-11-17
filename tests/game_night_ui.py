"""Chromium smoke and interaction tests for the completely offline 1.1 HTML edition."""
import asyncio, json, os, shutil
from pathlib import Path
from playwright.async_api import async_playwright

PAGE=Path(__file__).resolve().parents[1]/'play.html'
HTML=PAGE.read_text(encoding='utf-8')
async def open_game(context,initial=None):
    page=await context.new_page()
    await page.evaluate("""(entries) => {const kv={...entries};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>Object.hasOwn(kv,k)?kv[k]:null,setItem:(k,v)=>{kv[k]=String(v)},removeItem:k=>{delete kv[k]}}});}""",initial or {})
    await page.set_content(HTML,wait_until='domcontentloaded')
    return page
async def run():
    checks=[];errors=[]
    async with async_playwright() as pw:
        browser=await pw.chromium.launch(headless=True, executable_path=os.environ.get('BLOCKCLUB_CHROMIUM') or shutil.which('chromium') or '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args=['--no-sandbox'])
        context=await browser.new_context(accept_downloads=True, viewport={'width':390,'height':844})
        page=await open_game(context);page.on('pageerror',lambda e:errors.append(str(e)))
        await page.locator('[data-act="humans"][data-value="2"]').click()
        await page.locator('[data-act="bots"][data-value="0"]').click()
        await page.locator('#playerName').fill('Alex')
        await page.locator('#playerName1').fill('Blair')
        await page.locator('[data-act="rounds"][data-value="6"]').click()
        await page.locator('[data-act="start"]').click()
        assert await page.get_by_text('Pass to Alex').is_visible()
        assert await page.locator('.board').count()==0,'Private handoff must not render board'
        await page.locator('[data-act="readySeat"]').click()
        assert await page.locator('.tile').count()==40
        s=await page.evaluate('window.__BLOCKCLUB_QA__.game')
        assert [p['bot'] for p in s['players']]==[False,False]
        assert [p['name'] for p in s['players']]==['Alex','Blair']
        assert s['roundLimit']==6
        checks.append('2-human / 0-AI setup, 6-round limit, private start handoff')
        # Deterministic roll at tile 3, then buy and complete first turn.
        await page.evaluate('Math.random=(()=>{const seq=[0,.2];let i=0;return ()=>seq[(i++)%2]})()')
        await page.locator('[data-act="roll"]').click()
        await page.wait_for_timeout(600)
        assert await page.locator('[data-act="buy"]').is_visible()
        await page.locator('[data-act="buy"]').click()
        assert (await page.evaluate('window.__BLOCKCLUB_QA__.game'))['assets'][3]['owner']==0
        await page.locator('[data-act="end"]').click()
        assert await page.get_by_text('Pass to Blair').is_visible()
        assert await page.locator('.board').count()==0
        await page.locator('[data-act="readySeat"]').click()
        assert await page.locator('.tile').count()==40
        checks.append('turn transition hides board and transfers to second human')
        # Offline save file and cross-context import.
        async with page.expect_download() as info:
            await page.locator('[data-act="exportSave"]').click()
        download=await info.value
        assert download.suggested_filename=='block-club-1.1-save.json'
        exported=json.loads(Path(await download.path()).read_text())
        assert exported['game']['assets'][3]['owner']==0
        assert exported['format']=='blockclub-save'
        separate=await browser.new_context(accept_downloads=True,viewport={'width':390,'height':844})
        imported=await open_game(separate);imported.on('pageerror',lambda e:errors.append(str(e)))
        await imported.locator('#saveImport').set_input_files(files={'name':'game.json','mimeType':'application/json','buffer':json.dumps(exported).encode()})
        assert await imported.get_by_text('Pass to Blair').is_visible(timeout=3000)
        await imported.locator('[data-act="readySeat"]').click()
        resumed=await imported.evaluate('window.__BLOCKCLUB_QA__.game')
        assert resumed['assets'][3]['owner']==0 and resumed['current']==1
        checks.append('portable JSON export and import across browser contexts')
        # Trade fixtures: tests actual UI + private approval by receiving human.
        await imported.evaluate('''() => {
          const key='blockclub.game.v1';const g=JSON.parse(localStorage.getItem(key));
          g.current=0;g.turnCount=4;g.phase='roll';g.notice=null;g.assets[1].owner=0;g.assets[3].owner=1;
          localStorage.setItem(key,JSON.stringify(g));
        }''')
        fixture=await imported.evaluate("localStorage.getItem('blockclub.game.v1')")
        await imported.close()
        imported=await open_game(separate,{'blockclub.game.v1':fixture})
        imported.on('pageerror',lambda e:errors.append(str(e)))
        await imported.locator('[data-act="readySeat"]').click()
        await imported.locator('[data-act="trade"]').click()
        await imported.locator('#giveTile').select_option('1')
        await imported.locator('#takeTile').select_option('3')
        await imported.locator('#giveCash').fill('500')
        await imported.locator('[data-act="propose"]').click()
        assert await imported.get_by_text('Pass to Blair').is_visible()
        await imported.locator('[data-act="readySeat"]').click()
        assert await imported.locator('[data-act="tradeAccept"]').is_visible()
        await imported.locator('[data-act="tradeAccept"]').click()
        assert await imported.get_by_text('Pass to Alex').is_visible()
        await imported.locator('[data-act="readySeat"]').click()
        exchanged=await imported.evaluate('window.__BLOCKCLUB_QA__.game')
        assert exchanged['assets'][1]['owner']==1 and exchanged['assets'][3]['owner']==0
        assert exchanged['players'][0]['cash']==940 and exchanged['players'][1]['cash']==2000,exchanged['players']
        checks.append('human-to-human trade requires separate recipient approval and returns privately to proposer')
        # The game continues offline and motion can be disabled.
        if await imported.locator('.detail-sheet').count():
            await imported.locator('.detail-sheet [data-act="close"]').click()
        await imported.locator('[data-act="motion"]').click()
        assert await imported.evaluate('document.body.classList.contains("motion-off")')
        checks.append('optional animations can be disabled')
        # Dynamic setup and game sizes should never overflow horizontally.
        for width,height in [(320,700),(390,844),(412,915),(1280,850)]:
            await imported.set_viewport_size({'width':width,'height':height})
            assert await imported.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),f'horizontal overflow at {width}'
        checks.append('no horizontal overflow at 320,390,412,1280px')
        assert not errors,errors
        await separate.close();await context.close();await browser.close()
    return checks

if __name__=='__main__':
    result=asyncio.run(run())
    print(json.dumps({'passed':len(result),'checks':result},indent=2))
