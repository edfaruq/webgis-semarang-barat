# Shelter / Titik Kumpul Evakuasi

Folder ini untuk menyimpan data shelter atau titik kumpul evakuasi.

## Format Data

Data shelter dapat berupa GeoJSON dengan format:
- `Point` geometry untuk lokasi shelter
- Properties: nama, alamat, kapasitas, kelurahan, dll

## Contoh Struktur

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "nama": "Lapangan Manyaran",
        "alamat": "...",
        "kapasitas": 500,
        "kelurahan": "manyaran"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [lng, lat]
      }
    }
  ]
}
```
