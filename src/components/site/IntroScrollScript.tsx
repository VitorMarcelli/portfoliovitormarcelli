/**
 * Runs before the page paints, on the home pages only (where the transparent welcome intro plays):
 * stops the browser from restoring the old scroll position on reload, and holds any #anchor so the
 * browser does not jump to it behind the greeting. WelcomeLoader scrolls to the held anchor afterwards.
 */
const script = `(function(){try{var p=location.pathname.replace(/\\/$/,'');if(p!==''&&p!=='/en')return;if('scrollRestoration' in history)history.scrollRestoration='manual';if(location.hash){window.__introHash=location.hash;history.replaceState(history.state,'',location.pathname+location.search);}}catch(e){}})();`;

export default function IntroScrollScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
