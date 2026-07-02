import z from "zod";

export const SemanticNodeSchema = z.object({
  id: z.string(),
  role: z.string(),
  label: z.string(),
  description: z.string().optional(),
  visible: z.boolean(),
  importance: z.number(),
  annotated: z.boolean(),
});

export type SemanticNode = z.infer<typeof SemanticNodeSchema>;

export const SemanticGraphSchema = z.object({
  route: z.string(),
  title: z.string(),
  nodes: z.array(SemanticNodeSchema),
});

export type SemanticGraph = z.infer<typeof SemanticGraphSchema>;

export const SerializedToolSchema = z.object({
  id: z.string(),
  description: z.string(),
  inputSchema: z.record(z.string(), z.unknown()),
  needsApproval: z.boolean(),
});

export type SerializedTool = z.infer<typeof SerializedToolSchema>;

export const RuntimePermissionsSchema = z.object({
  navigate: z.boolean().optional(),
  click: z.boolean().optional(),
  type: z.boolean().optional(),
  highlight: z.boolean().optional(),
  scroll: z.boolean().optional(),
  extract: z.boolean().optional(),
});

export type RuntimePermissions = z.infer<typeof RuntimePermissionsSchema>;
