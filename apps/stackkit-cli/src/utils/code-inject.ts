import fs from 'fs-extra';
import path from 'path';

const CODE_MARKER_START = (id: string) => `// StackKit:${id}:start`;
const CODE_MARKER_END = (id: string) => `// StackKit:${id}:end`;

export interface CodeInjection {
  id: string;
  code: string;
  description: string;
}

export async function injectCode(
  filePath: string,
  injection: CodeInjection,
  position: 'append' | 'prepend' | { after: string } | { before: string },
  options: { force?: boolean } = {}
): Promise<void> {
  if (!await fs.pathExists(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  let content = await fs.readFile(filePath, 'utf-8');
  
  // Check if already injected
  const startMarker = CODE_MARKER_START(injection.id);
  if (content.includes(startMarker) && !options.force) {
    return; // Already injected, skip
  }

  // Remove old injection if force is true
  if (options.force) {
    content = removeInjection(content, injection.id);
  }

  // Prepare the code block with markers
  const markedCode = `\n${startMarker}\n${injection.code}\n${CODE_MARKER_END(injection.id)}\n`;

  // Inject based on position
  if (position === 'append') {
    content += markedCode;
  } else if (position === 'prepend') {
    content = markedCode + content;
  } else if ('after' in position) {
    const index = content.indexOf(position.after);
    if (index === -1) {
      throw new Error(`Could not find marker: ${position.after}`);
    }
    const insertPos = index + position.after.length;
    content = content.slice(0, insertPos) + markedCode + content.slice(insertPos);
  } else if ('before' in position) {
    const index = content.indexOf(position.before);
    if (index === -1) {
      throw new Error(`Could not find marker: ${position.before}`);
    }
    content = content.slice(0, index) + markedCode + content.slice(index);
  }

  await fs.writeFile(filePath, content, 'utf-8');
}

export function removeInjection(content: string, id: string): string {
  const startMarker = CODE_MARKER_START(id);
  const endMarker = CODE_MARKER_END(id);
  
  const startIndex = content.indexOf(startMarker);
  if (startIndex === -1) {
    return content;
  }
  
  const endIndex = content.indexOf(endMarker, startIndex);
  if (endIndex === -1) {
    return content;
  }
  
  // Remove everything from start marker to end marker (inclusive)
  const before = content.slice(0, startIndex);
  const after = content.slice(endIndex + endMarker.length);
  
  return before + after;
}

export function hasInjection(content: string, id: string): boolean {
  return content.includes(CODE_MARKER_START(id));
}
