export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    const response = await fetch(
      "https://api.football-data.org/v4/competitions/PD/matches?status=SCHEDULED",
      { headers: { "X-Auth-Token": process.env.FOOTBALL_API_KEY } }
    );
    if (!response.ok) throw new Error("Error: " + response.status);
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "No se pudieron obtener los partidos" });
  }
}
