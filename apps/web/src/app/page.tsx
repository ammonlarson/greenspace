import { GREENHOUSES } from "@greenspace/shared";

export default function Home() {
  return (
    <main>
      <h1>Greenspace 2026</h1>
      <p>Registration opens soon for greenhouses: {GREENHOUSES.join(", ")}</p>
    </main>
  );
}
