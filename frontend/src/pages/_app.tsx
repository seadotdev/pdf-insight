import { AppProps } from "next/app";
import { type AppType } from "next/dist/shared/lib/utils";
import { NavBar } from "~/components/landing-page/NavBar";
import "~/styles/globals.css";


function MyApp({ Component, pageProps }: AppProps) {
    return (
        <div className="h-screen w-screen flex flex-row grow overflow-hidden">
            <NavBar />
            <div className="flex flex-col h-full overflow-y-auto">
                <Component {...pageProps} />
            </div>
        </div>
    );
}

export default MyApp;
