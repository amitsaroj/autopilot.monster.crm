import { PartialType } from '@nestjs/swagger';
import { CreateWorkflowDto } from '../../workflow/dto/workflow.dto';

export { CreateWorkflowDto };

// Keep runtime PATCH/PUT validation while the shared update DTO is being introduced.
export class UpdateWorkflowDto extends PartialType(CreateWorkflowDto) {}
