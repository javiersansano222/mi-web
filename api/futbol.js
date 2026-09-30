export default async function handler(req, res) {
  // Permite que tu web llame a esta función
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const response = await fetch(
      "https://api.football-data.org/v4/competitions/PD/matches",
      {
        headers: {
          "X-Auth-Token": process.env.FOOTBALL_API_KEY
        }
      }
    );

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener partidos" });
  }
}