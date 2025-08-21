const fetch = require('node-fetch');

exports.getNearbyFacilities = async (req, res) => {
  try {
    const { lat, lng, type } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: "Latitude and longitude are required" });
    }

    // Default types to search for: hospital, pharmacy, clinic
    let facilityTypes = [];
    if (type) {
      facilityTypes = type.split(",").map(t => t.trim());
    } else {
      facilityTypes = ["hospital", "pharmacy", "clinic"];
    }

    const overpassQuery = `
      [out:json][timeout:25];
      (
        ${facilityTypes.map(t =>
          `node["amenity"="${t}"](around:3000,${lat},${lng});`
        ).join("\n")}
        ${facilityTypes.map(t =>
          `way["amenity"="${t}"](around:3000,${lat},${lng});`
        ).join("\n")}
      );
      out center;
    `;

    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;

    const response = await fetch(url);
    if (!response.ok) {
      return res.status(502).json({ message: "Failed to fetch data from Overpass API" });
    }

    const data = await response.json();

    // Transform the data into clean format for frontend
    const facilities = (data.elements || []).map(fac => {
      return {
        id: fac.id,
        name: fac.tags?.name || 'Unknown',
        type: fac.tags?.amenity || 'Unknown',
        lat: fac.lat || fac.center?.lat || null,
        lng: fac.lon || fac.center?.lon || null,
        address: fac.tags?.['addr:full'] ||
                 (fac.tags?.['addr:housenumber'] && fac.tags?.['addr:street']
                   ? `${fac.tags['addr:housenumber']} ${fac.tags['addr:street']}`
                   : fac.tags?.['addr:street'] || '') ||
                 '',
        phone: fac.tags?.phone || '',
        website: fac.tags?.website || '',
        emergency: fac.tags?.emergency || '',
      };
    });

    res.json(facilities);
  } catch (error) {
    console.error("Error fetching facilities:", error);
    res.status(500).json({ message: "Failed to fetch medical facilities" });
  }
};
