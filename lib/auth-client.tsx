import { expoClient } from "@better-auth/expo/client";
import { oneTimeTokenClient } from "better-auth/client/plugins"

import { emailOTPClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";

export const authClient = createAuthClient({
    // baseURL: "https://api.kaizin.work/", 
    baseURL: "https://financas.kaizin.work", 
    // baseURL: "http://192.168.18.152:3000",
    plugins: [
        oneTimeTokenClient(),
        emailOTPClient(),
        expoClient({
            scheme: "billsapp",
            storagePrefix: "billsapp",
            storage: SecureStore,
        }),
    ],
    fetchOptions: {
        timeout: 10000,
    }
});
