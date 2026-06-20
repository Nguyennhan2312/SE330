export function getRolesFromToken(token: string | null) {
  if (!token || typeof window === "undefined") return [];

  try {
    const payload = decodeJwtPayload(token);
    const nestedUser = payload.user;
    const realmAccess = payload.realm_access;
    const resourceAccessRoles = payload.resource_access
      ? Object.values(payload.resource_access).flatMap((resource) => resource?.roles ?? [])
      : [];
    const rawRoles = [
      payload.role,
      payload.roles,
      payload.authorities,
      payload.authority,
      payload.scope,
      payload.scp,
      nestedUser?.role,
      nestedUser?.roles,
      realmAccess?.roles,
      resourceAccessRoles,
    ].flatMap(normalizeRoleValue);

    return Array.from(new Set(rawRoles.map((role) => role.replace(/^ROLE_/, "").toUpperCase())));
  } catch {
    return [];
  }
}

type JwtPayload = {
  role?: RoleValue;
  roles?: RoleValue;
  authority?: RoleValue;
  authorities?: RoleValue;
  scope?: RoleValue;
  scp?: RoleValue;
  user?: {
    role?: RoleValue;
    roles?: RoleValue;
  };
  realm_access?: {
    roles?: RoleValue;
  };
  resource_access?: Record<string, { roles?: string[] } | undefined>;
};

type RoleValue = string | string[] | Array<{ authority?: string; name?: string; role?: string }>;

function decodeJwtPayload(token: string) {
  const payloadSegment = token.split(".")[1];

  if (!payloadSegment) {
    throw new Error("Invalid JWT payload.");
  }

  const base64 = payloadSegment.replace(/-/g, "+").replace(/_/g, "/");
  const paddedBase64 = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  const json = decodeURIComponent(
    window
      .atob(paddedBase64)
      .split("")
      .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`)
      .join(""),
  );

  return JSON.parse(json) as JwtPayload;
}

function normalizeRoleValue(value?: RoleValue) {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value
      .flatMap((item) => {
        if (typeof item === "string") return item.split(/[,\s]+/);

        return [item.authority, item.name, item.role];
      })
      .filter((role): role is string => Boolean(role));
  }

  return value.split(/[,\s]+/).filter(Boolean);
}

export function getAuthDebugInfo(token: string | null) {
  if (!token || typeof window === "undefined") {
    return { roles: [], payload: null };
  }

  try {
    return {
      roles: getRolesFromToken(token),
      payload: decodeJwtPayload(token) as {
      role?: string;
      roles?: string[] | string;
      authorities?: Array<string | { authority?: string }> | string;
      scope?: string;
      scp?: string[] | string;
      },
    };
  } catch {
    return { roles: [], payload: null };
  }
}

export function hasStaffAccessFromToken(token: string | null) {
  return hasAnyRole(token, ["LIBRARIAN", "ADMIN"]);
}

export function hasAdminAccessFromToken(token: string | null) {
  return hasAnyRole(token, ["ADMIN"]);
}

function hasAnyRole(token: string | null, acceptedRoles: string[]) {
  const normalizedAccepted = acceptedRoles.map((role) => role.replace(/^ROLE_/, "").toUpperCase());
  return getRolesFromToken(token).some((role) => normalizedAccepted.includes(role));
}
