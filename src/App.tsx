import { useEffect, useState } from "react";
import { Landing } from "@/pages/Landing";
import { Dashboard } from "@/pages/Dashboard";

type Route = "landing" | "dashboard";

function currentRoute(): Route {
  return window.location.hash.startsWith("#/dashboard") ? "dashboard" : "landing";
}

export default function App() {
  const [route, setRoute] = useState<Route>(currentRoute);

  useEffect(() => {
    const onHash = () => {
      setRoute(currentRoute());
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  return route === "dashboard" ? <Dashboard /> : <Landing />;
}
