// src/services/plants.js
import { supabase } from "../lib/supabaseClient";

export async function createPlant(plant) {
  const { data, error } = await supabase
    .from("plants")
    .insert([{ ...plant }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function listPlants() {
  const { data, error } = await supabase
    .from("plants")
    .select("*")
    .order("inserted_at", { ascending: false });
  if (error) throw error;
  return data;
}

// add update/delete as needed
