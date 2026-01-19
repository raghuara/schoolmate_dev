// Loader.js
import React from "react";
import '../Css/Page.css'

const Loader = ({ showOverlay = true }) => {
    return (
        <div style={styles.loaderWrapper(showOverlay)}>
            <div className="loader"></div>
        </div>
    );
};

const styles = {
    loaderWrapper: (showOverlay) => ({
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: showOverlay ? "rgba(255, 255, 255, 0.8)" : "transparent",
        zIndex: 9999,
    }),
};

export default Loader;
