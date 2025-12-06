import { Entity } from "@/domain/entity/Entity.ts";

export class Room extends Entity<Room>{
  id!: string;
  name!: string;
  capacity!: number;                  
  accessibilityFeatures?: string[];   
  photoUrl!: string;                  
  status!: 'active' | 'maintenance' | 'occupied' ;  
}
