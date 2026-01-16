export interface GeoJSONFeature {
  type: "Feature";
  geometry: {
    type: "Point" | "Polygon" | "LineString" | "MultiPoint" | "MultiPolygon" | "MultiLineString";
    coordinates: number[] | number[][] | number[][][];
  };
  properties: Record<string, any>;
}

export interface GeoJSONCollection {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
}

export interface BoundaryProperties {
  nama_wilayah?: string;
  nama_kelurahan?: string;
  luas?: number;
  kode?: string;
  [key: string]: any;
}

export interface FacilityProperties {
  nama?: string;
  kategori?: "sekolah" | "puskesmas" | "posko" | "pasar" | "masjid" | "gereja" | "vihara" | "pura" | "lainnya";
  alamat?: string;
  [key: string]: any;
}

export interface RiskProperties {
  tingkat_kerawanan?: "rendah" | "sedang" | "tinggi";
  jenis?: "banjir" | "longsor";
  deskripsi?: string;
  [key: string]: any;
}

export type BasemapType = "osm" | "esri-imagery";
