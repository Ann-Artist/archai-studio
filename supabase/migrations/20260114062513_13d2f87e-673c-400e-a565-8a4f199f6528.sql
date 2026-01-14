-- Create floor_plan_projects table to store generated floor plans with room data
CREATE TABLE public.floor_plan_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT 'Untitled Floor Plan',
  plot_width NUMERIC NOT NULL DEFAULT 20,
  plot_depth NUMERIC NOT NULL DEFAULT 16,
  rooms JSONB NOT NULL DEFAULT '[]'::jsonb,
  image_url TEXT,
  style TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.floor_plan_projects ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own floor plans" 
ON public.floor_plan_projects 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own floor plans" 
ON public.floor_plan_projects 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own floor plans" 
ON public.floor_plan_projects 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own floor plans" 
ON public.floor_plan_projects 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_floor_plan_projects_updated_at
BEFORE UPDATE ON public.floor_plan_projects
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();