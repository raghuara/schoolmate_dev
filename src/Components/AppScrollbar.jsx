import React from "react";
import SimpleBar from "simplebar-react";

export default function AppScrollbar({ children, style, className = "", ...rest }) {
    return (
        <SimpleBar
            className={`app-scrollbar ${className}`.trim()}
            style={style}
            autoHide={false}
            {...rest}
        >
            {children}
        </SimpleBar>
    );
}
