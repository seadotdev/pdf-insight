import React from "react";

import type { NextPage } from "next";
import { MarketingSection } from "~/components/landing-page/MarketingSection";
import { TitlePage } from "~/components/landing-page/TitlePage";

const LandingPage: NextPage = () => {
    return (
        <>
            <TitlePage />
            {/* <MarketingSection /> */}
        </>
    );
};

export default LandingPage;
