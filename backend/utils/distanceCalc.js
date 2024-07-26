

function calculateDistance(lat1, lon1, lat2, lon2) {  //haversine formula
  const R = 3959; //earth radius
  const dLat = degeesRadian(lat2 - lat1);
  const dLon = degeesRadian(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degeesRadian(lat1)) *
      Math.cos(degeesRadian(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

function degeesRadian(deg) {
  return deg * (Math.PI / 180);
}

export default calculateDistance;