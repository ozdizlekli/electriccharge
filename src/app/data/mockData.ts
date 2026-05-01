import { Station, Reservation, PaymentMethod } from '../types/station';

export const mockStations: Station[] = [
  {
    id: '6',
    name: 'İzmir Konak Pier Şarj İstasyonu',
    brand: 'Eşarj',
    address: 'Konak, Atatürk Caddesi No:19, 35250 Konak',
    city: 'İzmir',
    location: { lat: 38.4192, lng: 27.1287 },
    distance: 8.5,
    chargingPoints: [
      {
        id: 'cp15',
        type: 'DC',
        power: 150,
        connector: 'CCS2',
        status: 'available',
        price: 8.0
      },
      {
        id: 'cp16',
        type: 'DC',
        power: 150,
        connector: 'CHAdeMO',
        status: 'available',
        price: 8.0
      },
      {
        id: 'cp17',
        type: 'AC',
        power: 22,
        connector: 'Type 2',
        status: 'occupied',
        currentUser: {
          endTime: new Date(Date.now() + 45 * 60000),
          remainingMinutes: 45
        },
        price: 4.0
      }
    ],
    amenities: ['AVM', 'Restoran', 'Deniz Manzarası', 'WiFi'],
    rating: 4.7,
    totalReviews: 156,
    images: ['https://images.unsplash.com/photo-1593941707882-a5bba14938c7'],
    isOpen24Hours: true
  },
  {
    id: '7',
    name: 'İzmir Bornova Forum Şarj Noktası',
    brand: 'Voltrun',
    address: 'Erzene, Ankara Cd. No:295, 35100 Bornova',
    city: 'İzmir',
    location: { lat: 38.4638, lng: 27.2107 },
    distance: 12.3,
    chargingPoints: [
      {
        id: 'cp18',
        type: 'DC',
        power: 120,
        connector: 'CCS2',
        status: 'available',
        price: 7.5
      },
      {
        id: 'cp19',
        type: 'AC',
        power: 22,
        connector: 'Type 2',
        status: 'available',
        price: 3.8
      }
    ],
    amenities: ['AVM', 'Sinema', 'Restoran', 'Tuvalet'],
    rating: 4.5,
    totalReviews: 98,
    images: ['https://images.unsplash.com/photo-1617704548623-340376564e68'],
    isOpen24Hours: false,
    openingHours: '10:00 - 22:00'
  },
  {
    id: '8',
    name: 'İzmir Karşıyaka Çarşı Şarj',
    brand: 'ZES',
    address: 'Çarşı, Alaybey Cd., 35580 Karşıyaka',
    city: 'İzmir',
    location: { lat: 38.4607, lng: 27.1056 },
    distance: 14.2,
    chargingPoints: [
      {
        id: 'cp20',
        type: 'DC',
        power: 180,
        connector: 'CCS2',
        status: 'available',
        price: 9.0
      },
      {
        id: 'cp21',
        type: 'AC',
        power: 22,
        connector: 'Type 2',
        status: 'available',
        price: 4.2
      }
    ],
    amenities: ['Çarşı', 'Kafe', 'Park'],
    rating: 4.3,
    totalReviews: 72,
    images: ['https://images.unsplash.com/photo-1585208798174-6cedd86e019a'],
    isOpen24Hours: true
  },
  {
    id: '9',
    name: 'Güzelbahçe Sahil Şarj İstasyonu',
    brand: 'Eşarj',
    address: 'Kahramandere, Sahil Yolu No:45, 35310 Güzelbahçe',
    city: 'İzmir',
    location: { lat: 38.3725, lng: 27.1572 },
    distance: 1.2,
    chargingPoints: [
      {
        id: 'cp22',
        type: 'DC',
        power: 150,
        connector: 'CCS2',
        status: 'available',
        price: 8.0
      },
      {
        id: 'cp23',
        type: 'AC',
        power: 22,
        connector: 'Type 2',
        status: 'available',
        price: 4.0
      }
    ],
    amenities: ['Deniz Manzarası', 'Kafe', 'Park', 'WiFi'],
    rating: 4.6,
    totalReviews: 87,
    images: ['https://images.unsplash.com/photo-1560179707-f14e90ef3623'],
    isOpen24Hours: true
  },
  {
    id: '10',
    name: 'Balçova Termal Otel Şarj',
    brand: 'Voltrun',
    address: 'Teleferik, İzmir Cd. No:132, 35330 Balçova',
    city: 'İzmir',
    location: { lat: 38.3936, lng: 27.0282 },
    distance: 5.8,
    chargingPoints: [
      {
        id: 'cp24',
        type: 'DC',
        power: 120,
        connector: 'CCS2',
        status: 'occupied',
        currentUser: {
          endTime: new Date(Date.now() + 30 * 60000),
          remainingMinutes: 30
        },
        price: 7.5
      },
      {
        id: 'cp25',
        type: 'AC',
        power: 22,
        connector: 'Type 2',
        status: 'available',
        price: 3.8
      },
      {
        id: 'cp26',
        type: 'AC',
        power: 22,
        connector: 'Type 2',
        status: 'available',
        price: 3.8
      }
    ],
    amenities: ['Otel', 'Termal', 'Restoran', 'Spa'],
    rating: 4.8,
    totalReviews: 145,
    images: ['https://images.unsplash.com/photo-1621264448270-9ef00e88a935'],
    isOpen24Hours: false,
    openingHours: '08:00 - 23:00'
  },
  {
    id: '11',
    name: 'Narlıdere Migros Şarj Noktası',
    brand: 'ZES',
    address: 'Narlı, Mithatpaşa Cd. No:58, 35320 Narlıdere',
    city: 'İzmir',
    location: { lat: 38.4019, lng: 27.0625 },
    distance: 3.5,
    chargingPoints: [
      {
        id: 'cp27',
        type: 'DC',
        power: 180,
        connector: 'CCS2',
        status: 'available',
        price: 9.0
      },
      {
        id: 'cp28',
        type: 'DC',
        power: 180,
        connector: 'CHAdeMO',
        status: 'available',
        price: 9.0
      }
    ],
    amenities: ['Market', 'Otopark', 'Kafe'],
    rating: 4.4,
    totalReviews: 92,
    images: ['https://images.unsplash.com/photo-1593941707882-a5bba14938c7'],
    isOpen24Hours: false,
    openingHours: '09:00 - 22:00'
  }
];

export const mockReservations: Reservation[] = [
  {
    id: 'r1',
    stationId: '9',
    stationName: 'Güzelbahçe Sahil Şarj İstasyonu',
    chargingPointId: 'cp22',
    startTime: new Date(Date.now() + 2 * 60 * 60000), // 2 hours from now
    endTime: new Date(Date.now() + 3 * 60 * 60000),
    estimatedDuration: 60,
    price: 127.5,
    status: 'upcoming',
    paymentStatus: 'paid'
  },
  {
    id: 'r2',
    stationId: '11',
    stationName: 'Narlıdere Migros Şarj Noktası',
    startTime: new Date(Date.now() - 1 * 24 * 60 * 60000), // 1 day ago
    endTime: new Date(Date.now() - 1 * 24 * 60 * 60000 + 45 * 60000),
    chargingPointId: 'cp27',
    estimatedDuration: 45,
    price: 58.5,
    status: 'completed',
    paymentStatus: 'paid'
  },
  {
    id: 'r3',
    stationId: '6',
    stationName: 'İzmir Konak Pier Şarj İstasyonu',
    startTime: new Date(Date.now() - 3 * 24 * 60 * 60000),
    endTime: new Date(Date.now() - 3 * 24 * 60 * 60000 + 30 * 60000),
    chargingPointId: 'cp15',
    estimatedDuration: 30,
    price: 46.0,
    status: 'completed',
    paymentStatus: 'paid'
  }
];

export const mockPaymentMethods: PaymentMethod[] = [
  {
    id: 'pm1',
    type: 'credit',
    cardNumber: '4532',
    expiryDate: '12/26',
    cardHolder: 'Ahmet Yılmaz',
    isDefault: true
  },
  {
    id: 'pm2',
    type: 'debit',
    cardNumber: '5421',
    expiryDate: '08/27',
    cardHolder: 'Ahmet Yılmaz',
    isDefault: false
  }
];