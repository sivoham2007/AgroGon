import { v4 as uuid } from "uuid";

export function newId() {
  return uuid();
}

export function generateFarmerCode(stateCode = "XX") {
  const n = Math.floor(100000 + Math.random() * 899999);
  return `AGG-${stateCode.slice(0, 2).toUpperCase()}-${n}`;
}

export function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function publicFarmer(row) {
  if (!row) return null;
  return {
    id: row.id,
    farmerCode: row.farmer_code,
    name: row.name,
    phone: row.phone,
    email: row.email,
    preferredLanguage: row.preferred_language,
    state: row.state,
    district: row.district,
    village: row.village,
    lat: row.lat,
    lng: row.lng,
    primaryCrop: row.primary_crop,
    farmAreaAcres: row.farm_area_acres,
    age: row.age,
    phoneVerified: !!row.phone_verified,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
