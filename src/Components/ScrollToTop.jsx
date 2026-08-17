import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        const scroller = document.scrollingElement || document.documentElement;
        scroller.scrollTop = 0;
        document.body.scrollTop = 0;
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}
