from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum

class RoleEnum(str, Enum):
    manager = "manager"
    employee = "employee"

class PriorityEnum(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"

class StatusEnum(str, Enum):
    pending = "pending"
    in_progress = "in_progress"
    done = "done"

# User schemas
class UserCreate(BaseModel):
    name: str
    phone_number: str
    role: RoleEnum
    department: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    name: str
    phone_number: str
    role: RoleEnum
    department: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Task schemas
class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    assigned_to: int
    created_by: int
    priority: PriorityEnum = PriorityEnum.medium
    deadline: Optional[datetime] = None

class TaskUpdate(BaseModel):
    status: StatusEnum

class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    assigned_to: int
    created_by: int
    priority: PriorityEnum
    status: StatusEnum
    deadline: Optional[datetime]
    created_at: datetime
    completed_at: Optional[datetime]
    assignee: UserResponse
    creator: UserResponse

    class Config:
        from_attributes = True