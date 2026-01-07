import { Entity } from "@/domain/entity/Entity.ts";

export class Room extends Entity<Room>{
  id!: string;
  name!: string;
  capacity!: number;                  
  accessibility_features?: string[];   
  photo_url!: string;                  
  status!: 'active' | 'maintenance' | 'occupied' ;
  created_at!: Date;
  updated_at!: Date;
}
