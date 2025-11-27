import { Slot } from "expo-router";
import { AuthProvider } from "../src/context/AuthContext";
import { ThemeProvider } from "../src/context/ThemeContext";
import { FavoritesProvider } from "../src/context/FavoritesContext";
import { CheckoutProvider } from "../src/context/CheckoutContext";

export default function RootLayout() {
   return (
      <AuthProvider>
         <ThemeProvider>
            <FavoritesProvider>
               <CheckoutProvider>
                  <Slot />
               </CheckoutProvider>
            </FavoritesProvider>
         </ThemeProvider>
      </AuthProvider>
   )
}