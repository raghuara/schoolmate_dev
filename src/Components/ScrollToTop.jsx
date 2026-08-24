import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        // The dashboard shell scrolls inside its own container, so resetting the
        // window alone would leave a new page opening half way down.
        const appScroller = document.getElementById("app-scroll-container");
        if (appScroller) appScroller.scrollTop = 0;

        const scroller = document.scrollingElement || document.documentElement;
        scroller.scrollTop = 0;
        document.body.scrollTop = 0;
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}
