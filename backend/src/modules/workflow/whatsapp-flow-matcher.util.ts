type FlowNode = {
  id: string;
  type?: string;
  data?: Record<string, unknown>;
};

function readNodeType(node: FlowNode): string {
  const data = node.data ?? {};
  return String(data.stepType ?? data.nodeType ?? data.type ?? node.type ?? '').toUpperCase();
}

function readKeywordFromLabel(label: string): string | null {
  const quoted = label.match(/keyword:\s*"([^"]+)"/i);
  if (quoted?.[1]) {
    return quoted[1].trim();
  }
  const plain = label.match(/keyword:\s*([^\s,]+)/i);
  return plain?.[1]?.trim() ?? null;
}

/** Extract keyword trigger from a WhatsApp React Flow definition. */
export function extractWhatsappFlowKeyword(definition: Record<string, unknown>): string | null {
  const nodes = (definition.nodes as FlowNode[] | undefined) ?? [];
  if (!nodes.length) {
    return null;
  }

  const trigger =
    nodes.find((node) => {
      const type = readNodeType(node);
      return type.includes('TRIGGER') || node.data?.isTrigger === true || node.type === 'input';
    }) ?? nodes[0];

  const config =
    trigger.data?.config && typeof trigger.data.config === 'object'
      ? (trigger.data.config as Record<string, unknown>)
      : {};

  if (typeof config.keyword === 'string' && config.keyword.trim()) {
    return config.keyword.trim();
  }
  if (typeof trigger.data?.keyword === 'string' && String(trigger.data.keyword).trim()) {
    return String(trigger.data.keyword).trim();
  }

  const label = String(trigger.data?.label ?? '');
  return readKeywordFromLabel(label);
}

/** Case-insensitive exact or contains match for inbound WhatsApp text. */
export function messageMatchesKeyword(message: string, keyword: string): boolean {
  const normalizedKeyword = keyword.trim().toLowerCase();
  const normalizedMessage = message.trim().toLowerCase();
  if (!normalizedKeyword || !normalizedMessage) {
    return false;
  }
  return (
    normalizedMessage === normalizedKeyword ||
    normalizedMessage.includes(normalizedKeyword) ||
    normalizedMessage.startsWith(normalizedKeyword)
  );
}
