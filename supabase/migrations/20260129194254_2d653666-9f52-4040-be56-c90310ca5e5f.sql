-- Create a table to store interior design suggestions
CREATE TABLE public.interior_designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.floor_plan_projects(id) ON DELETE CASCADE NOT NULL,
  designer_id UUID NOT NULL,
  style TEXT NOT NULL DEFAULT 'modern',
  color_palette JSONB DEFAULT '[]'::jsonb,
  furniture_config JSONB DEFAULT '{}'::jsonb,
  materials_config JSONB DEFAULT '{}'::jsonb,
  reference_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.interior_designs ENABLE ROW LEVEL SECURITY;

-- RLS policies for interior_designs
CREATE POLICY "Designers can view all designs"
ON public.interior_designs
FOR SELECT
USING (
  public.has_role(auth.uid(), 'interior_designer') OR 
  public.has_role(auth.uid(), 'architect') OR
  auth.uid() = designer_id
);

CREATE POLICY "Designers can create designs"
ON public.interior_designs
FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'interior_designer') AND
  auth.uid() = designer_id
);

CREATE POLICY "Designers can update their own designs"
ON public.interior_designs
FOR UPDATE
USING (auth.uid() = designer_id);

CREATE POLICY "Designers can delete their own designs"
ON public.interior_designs
FOR DELETE
USING (auth.uid() = designer_id);

-- Users can view designs for their projects
CREATE POLICY "Users can view designs for their projects"
ON public.interior_designs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.floor_plan_projects
    WHERE id = project_id AND user_id = auth.uid()
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_interior_designs_updated_at
BEFORE UPDATE ON public.interior_designs
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();