export interface ChargingPoint {
  id: string;
  type: 'AC' | 'DC';
  power: number; // kW
  connector: string;
  status: 'available' | 'occupied' | 'maintenance';
  currentUser?: {
    endTime: Date;
    remainingMinutes: number;
  };
  price: number; // TL per kWh
}

export interface Station {
  id: string;
  name: string;
  brand: string;
  address: string;
  city: string;
  location: {
    lat: number;
    lng: number;
  };
  distance: number; // km
  chargingPoints: ChargingPoint[];
  amenities: string[];
  rating: number;
  totalReviews: number;
  images: string[];
  isOpen24Hours: boolean;
  openingHours?: string;
}

export interface Reservation {
  id: string;
  stationId: string;
  stationName: string;
  chargingPointId: string;
  startTime: Date;
  endTime: Date;
  estimatedDuration: number; // minutes
  price: number;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded';
}

export interface PaymentMethod {
  id: string;
  type: 'credit' | 'debit';
  cardNumber: string; // last 4 digits
  expiryDate: string;
  cardHolder: string;
  isDefault: boolean;
}
