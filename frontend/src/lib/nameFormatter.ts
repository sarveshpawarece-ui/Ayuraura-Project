/**
 * AyurSetu Role-Based Name & Prefix Identity System
 * Strictly enforces appropriate prefixes based on user role:
 * - DOCTOR: Dr., Vaidya, Dr. (Vaidya), Hakim
 * - FACULTY: Prof., Dr., Prof. Dr., Assoc. Prof., Asst. Prof., Lecturer
 * - STUDENT: None, Mr., Ms., Mx. (Non-professional prefixes ONLY; never automatically or manually assign Dr.)
 * - INSTITUTION: Dean, Principal, Director, Registrar, HOD, Prof. Dr., Prof., Dr., Mr., Ms., None
 * - INDUSTRY: Mr., Ms., Dr., None
 */

export interface PrefixOption {
  value: string;
  label: string;
  isDefault?: boolean;
}

export const ROLE_PREFIX_OPTIONS: Record<string, PrefixOption[]> = {
  DOCTOR: [
    { value: "Dr.", label: "Dr. (Doctor)", isDefault: true },
    { value: "Vaidya", label: "Vaidya (Ayurvedic Physician)" },
    { value: "Dr. (Vaidya)", label: "Dr. (Vaidya)" },
    { value: "Hakim", label: "Hakim (Traditional Clinician)" },
  ],
  FACULTY: [
    { value: "Prof.", label: "Prof. (Professor)", isDefault: true },
    { value: "Prof. Dr.", label: "Prof. Dr. (Professor & Doctor)" },
    { value: "Dr.", label: "Dr. (Doctorate)" },
    { value: "Assoc. Prof.", label: "Assoc. Prof." },
    { value: "Asst. Prof.", label: "Asst. Prof." },
    { value: "Lecturer", label: "Lecturer" },
  ],
  STUDENT: [
    { value: "", label: "None (No Prefix)", isDefault: true },
    { value: "Mr.", label: "Mr." },
    { value: "Ms.", label: "Ms." },
    { value: "Mx.", label: "Mx." },
  ],
  INSTITUTION: [
    { value: "Principal", label: "Principal (Institutional Head)", isDefault: true },
    { value: "Dean", label: "Dean" },
    { value: "Director", label: "Director" },
    { value: "Registrar", label: "Registrar" },
    { value: "HOD", label: "Head of Department (HOD)" },
    { value: "Prof. Dr.", label: "Prof. Dr." },
    { value: "Prof.", label: "Prof." },
    { value: "Dr.", label: "Dr." },
    { value: "Mr.", label: "Mr." },
    { value: "Ms.", label: "Ms." },
    { value: "", label: "None" },
  ],
  INDUSTRY: [
    { value: "Mr.", label: "Mr." },
    { value: "Ms.", label: "Ms." },
    { value: "Dr.", label: "Dr. (R&D / Scientific Lead)" },
    { value: "", label: "None", isDefault: true },
  ],
  NGO: [
    { value: "Mr.", label: "Mr." },
    { value: "Ms.", label: "Ms." },
    { value: "Dr.", label: "Dr. (Medical Coordinator)" },
    { value: "Vaidya", label: "Vaidya" },
    { value: "", label: "None", isDefault: true },
  ],
};

/**
 * Retrieves valid prefix options for a given role.
 * Guaranteed never to return medical prefixes like Dr. for students.
 */
export function getRolePrefixOptions(role?: string): PrefixOption[] {
  if (!role) return ROLE_PREFIX_OPTIONS.STUDENT;
  const upper = role.toUpperCase();
  return ROLE_PREFIX_OPTIONS[upper] || ROLE_PREFIX_OPTIONS.STUDENT;
}

export function getDefaultPrefixForRole(role?: string): string {
  const options = getRolePrefixOptions(role);
  const defaultOpt = options.find((opt) => opt.isDefault);
  return defaultOpt ? defaultOpt.value : (options[0]?.value || "");
}

export interface StructuredNameParams {
  prefix?: string | null;
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  fallbackFullName?: string | null;
  role?: string;
}

/**
 * Standardizes formatting of full personal names across AyurSetu:
 * e.g.
 * - prefix: "Dr.", first: "Rajesh", last: "Varma" -> "Dr. Rajesh Varma"
 * - prefix: "Prof. Dr.", first: "Anand", middle: "K.", last: "Joshi" -> "Prof. Dr. Anand K. Joshi"
 * - prefix: "", first: "Priya", last: "Sharma" -> "Priya Sharma"
 *
 * Prevents redundant duplicate titles (e.g. will not generate "Dr. Dr. Rajesh Varma").
 */
export function formatFullName(params: StructuredNameParams): string {
  const prefix = (params.prefix || "").trim();
  const first = (params.firstName || "").trim();
  const middle = (params.middleName || "").trim();
  const last = (params.lastName || "").trim();

  // If structured name fields are provided:
  if (first || last) {
    const parts: string[] = [];
    if (prefix) parts.push(prefix);
    if (first) parts.push(first);
    if (middle) parts.push(middle);
    if (last) parts.push(last);
    return parts.join(" ").trim();
  }

  // If only fallback full_name is available
  const rawFallback = (params.fallbackFullName || "").trim();
  if (!rawFallback) return "";

  // If the fallback already starts with the prefix, do not duplicate it
  if (prefix) {
    const regex = new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (regex.test(rawFallback)) {
      return rawFallback;
    }
    // Check for common prefix collisions (e.g. Dr. already on string)
    if (/^(Dr\.|Prof\.|Vaidya|Hakim|Mr\.|Ms\.|Mx\.|Dean|Principal)/i.test(rawFallback)) {
      return rawFallback;
    }
    return `${prefix} ${rawFallback}`.trim();
  }

  return rawFallback;
}

/**
 * Decomposes an existing monolithic fullName into structured parts,
 * detecting known prefixes based on role rules.
 */
export function parseNameParts(
  rawFullName?: string | null,
  role?: string
): { prefix: string; firstName: string; middleName: string; lastName: string } {
  if (!rawFullName || !rawFullName.trim()) {
    return {
      prefix: getDefaultPrefixForRole(role),
      firstName: "",
      middleName: "",
      lastName: "",
    };
  }

  const trimmed = rawFullName.trim();
  const prefixOptions = getRolePrefixOptions(role);

  let detectedPrefix = "";
  let nameWithoutPrefix = trimmed;

  // Check against valid prefix options for this role, matching longest prefixes first
  const sortedPrefixes = [...prefixOptions]
    .filter((p) => p.value.length > 0)
    .sort((a, b) => b.value.length - a.value.length);

  for (const opt of sortedPrefixes) {
    const prefixStr = opt.value;
    const regex = new RegExp(`^${prefixStr.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s+`, "i");
    if (regex.test(trimmed)) {
      detectedPrefix = opt.value;
      nameWithoutPrefix = trimmed.replace(regex, "").trim();
      break;
    }
  }

  // If role is DOCTOR and detectedPrefix is empty, default to "Dr."
  if (!detectedPrefix && role?.toUpperCase() === "DOCTOR") {
    detectedPrefix = "Dr.";
  }

  const tokens = nameWithoutPrefix.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) {
    return { prefix: detectedPrefix, firstName: "", middleName: "", lastName: "" };
  }
  if (tokens.length === 1) {
    return { prefix: detectedPrefix, firstName: tokens[0], middleName: "", lastName: "" };
  }
  if (tokens.length === 2) {
    return { prefix: detectedPrefix, firstName: tokens[0], middleName: "", lastName: tokens[1] };
  }

  // 3 or more tokens: first = tokens[0], last = tokens[tokens.length - 1], middle = everything in between
  return {
    prefix: detectedPrefix,
    firstName: tokens[0],
    middleName: tokens.slice(1, -1).join(" "),
    lastName: tokens[tokens.length - 1],
  };
}
