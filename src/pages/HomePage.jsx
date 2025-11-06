import { useEffect } from "react";
import { listPlants } from "../services/plants";

useEffect(() => {
  listPlants().then((plants) => console.log(plants));
}, []);

export default function HomePage() {
  return (
    <div className="home-page">
      <h2>Welcome to Harvestly</h2>
      <p>Your go-to app for managing your harvests efficiently.</p>
    </div>
  );
}
