import { SetMetadata } from "@nestjs/common";
import { SET_ROLES_KEY } from "src/common/constants";
import { Roles } from "src/common/enums/roles.enum";

export const SetRoles = (...roles: Roles[]) => SetMetadata(SET_ROLES_KEY, roles);