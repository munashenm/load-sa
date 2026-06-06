-- Street-level coordinates for pickup and drop-off (Google Places / geocoding)
ALTER TABLE "Booking" ADD COLUMN "pickupLat" DOUBLE PRECISION;
ALTER TABLE "Booking" ADD COLUMN "pickupLng" DOUBLE PRECISION;
ALTER TABLE "Booking" ADD COLUMN "dropoffLat" DOUBLE PRECISION;
ALTER TABLE "Booking" ADD COLUMN "dropoffLng" DOUBLE PRECISION;
