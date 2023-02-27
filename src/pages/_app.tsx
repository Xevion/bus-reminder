import {AppType} from "next/app";
import "@/styles/globals.scss";

const MyApp: AppType = ({ Component, pageProps }) => {
    return (
        <>
                <Component {...pageProps} />
        </>
    );
};

export default MyApp;