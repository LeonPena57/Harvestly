// src/services/tasks.js
import { supabase } from "../lib/supabaseClient";

const TASK_TYPES = ["water", "fertilize", "mist", "turn"];

const TASK_TEMPLATES = {
  water: {
    title: (plantName) => `Water ${plantName}`,
    description: (plant) =>
      plant?.water_amount?.trim()
        ? plant.water_amount.trim()
        : "Around 500ml.",
  },
  fertilize: {
    title: (plantName) => `Add fertilizer to ${plantName}`,
    description: () => "Please check your fertiliser package for more info.",
  },
  mist: {
    title: (plantName) => `Mist ${plantName}`,
    description: (plant) =>
      plant?.notes?.trim()
        ? `Focus on: ${plant.notes.trim()}`
        : "Give the foliage a gentle, even misting.",
  },
  turn: {
    title: (plantName) => `Turn ${plantName}`,
    description: () =>
      "Rotate the pot about 90° to keep growth balanced toward the light.",
  },
};

function resolvePlantName(plant) {
  return (
    plant?.nickname?.trim() ||
    plant?.official_name?.trim() ||
    "your plant"
  );
}

export function generateTaskContent(taskType, plant) {
  if (!TASK_TYPES.includes(taskType)) {
    throw new Error(
      `Unsupported task type "${taskType}". Expected one of: ${TASK_TYPES.join(
        ", "
      )}`
    );
  }

  const plantName = resolvePlantName(plant);
  const template = TASK_TEMPLATES[taskType];

  return {
    title: template.title(plantName),
    description: template.description(plant),
  };
}

export async function createTask({
  userId,
  plantId,
  dueDate,
  taskType,
  title,
  description,
  completed = false,
}) {
  if (!userId) throw new Error("createTask requires a userId.");
  if (!plantId) throw new Error("createTask requires a plantId.");
  if (!dueDate) throw new Error("createTask requires a dueDate.");
  if (!TASK_TYPES.includes(taskType)) {
    throw new Error(
      `Unsupported task type "${taskType}". Expected one of: ${TASK_TYPES.join(
        ", "
      )}`
    );
  }

  const payload = {
    user_id: userId,
    plant_id: plantId,
    due_date: dueDate,
    task_type: taskType,
    title,
    description,
    completed,
  };

  const { data, error } = await supabase
    .from("tasks")
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function listTasks(userId) {
  if (!userId) throw new Error("listTasks requires a userId.");

  const { data, error } = await supabase
    .from("tasks")
    .select(
      `
        id,
        user_id,
        plant_id,
        due_date,
        task_type,
        title,
        description,
        completed,
        inserted_at,
        updated_at,
        plants:plant_id (
          id,
          nickname,
          official_name
        )
      `
    )
    .eq("user_id", userId)
    .order("due_date", { ascending: true })
    .order("inserted_at", { ascending: true });

  if (error) throw error;
  return data;
}

export async function updateTask(id, userId, updates) {
  if (!id) throw new Error("updateTask requires an id.");
  if (!userId) throw new Error("updateTask requires a userId.");

  const allowedUpdates = {};
  if (typeof updates.completed === "boolean") {
    allowedUpdates.completed = updates.completed;
  }
  if (updates.dueDate) {
    allowedUpdates.due_date = updates.dueDate;
  }
  if (updates.title) {
    allowedUpdates.title = updates.title;
  }
  if (updates.description) {
    allowedUpdates.description = updates.description;
  }

  if (Object.keys(allowedUpdates).length === 0) {
    throw new Error("No valid fields supplied to updateTask.");
  }

  const { data, error } = await supabase
    .from("tasks")
    .update(allowedUpdates)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTask(id, userId) {
  if (!id) throw new Error("deleteTask requires an id.");
  if (!userId) throw new Error("deleteTask requires a userId.");

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
}
