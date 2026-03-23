const MAKKAH_LAT = 21.4225;
const MAKKAH_LNG = 39.8262;

export function getQiblaDirection(lat: number, lng: number) {
  const latRad = (lat * Math.PI) / 180;
  const lngRad = (lng * Math.PI) / 180;
  const makkahLatRad = (MAKKAH_LAT * Math.PI) / 180;
  const makkahLngRad = (MAKKAH_LNG * Math.PI) / 180;

  const y = Math.sin(makkahLngRad - lngRad);
  const x =
    Math.cos(latRad) * Math.tan(makkahLatRad) -
    Math.sin(latRad) * Math.cos(makkahLngRad - lngRad);

  const qibla = (Math.atan2(y, x) * 180) / Math.PI;
  return (qibla + 360) % 360;
}
