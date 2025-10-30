// rooms/room.model.js

class Room {
  constructor(opts) {
    if (!opts) throw new Error("Room options (atributos) son requeridos");

    const {
      id,
      name,
      capacity,
      location,
      floor,
      hasVideo = false,
      hasWhiteboard = false,
      powerOutlets = 0,
      accessibilityFeatures = [],
      status = "ACTIVE",
      photoUrl,
    } = opts;

    // 
    if (!id) {
      throw new Error("El atributo 'id' es requerido");
    }

    if (!name) {
      throw new Error("El atributo 'name' es requerido");
    }

    if (typeof capacity !== "number" || capacity <= 0) {
      throw new Error("El atributo 'capacity' debe ser un número mayor a 0");
    }

    const validStatuses = ["ACTIVE", "MAINTENANCE"];
    if (!validStatuses.includes(status)) {
      throw new Error(
        `El atributo 'status' debe ser uno de: ${validStatuses.join(", ")}`
      );
    }

    // 
    this.id = id;
    this.name = name;
    this.capacity = capacity;
    this.location = location;
    this.floor = floor;
    this.hasVideo = hasVideo;
    this.hasWhiteboard = hasWhiteboard;
    this.powerOutlets = powerOutlets;
    this.accessibilityFeatures = accessibilityFeatures;
    this.status = status;
    this.photoUrl = photoUrl;
  }
}

module.exports = Room;
