import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const urlSchema = z.object({
  url: z.string().url('Please enter a valid URL'),
  inputType: z.enum(['single', 'multiple']),
});

type FormData = z.infer<typeof urlSchema>;

interface UrlInputFormProps {
  onSubmit: (data: FormData) => void;
}

export function UrlInputForm({ onSubmit }: UrlInputFormProps) {
  const [inputType, setInputType] = useState<'single' | 'multiple'>('single');
  
  const form = useForm<FormData>({
    resolver: zodResolver(urlSchema),
    defaultValues: {
      url: '',
      inputType: 'single',
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit(data);
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <RadioGroup
          defaultValue="single"
          onValueChange={(value: 'single' | 'multiple') => setInputType(value)}
          className="flex flex-col space-y-1"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="single" id="single" />
            <Label htmlFor="single">Single URL</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="multiple" id="multiple" />
            <Label htmlFor="multiple">Multiple URLs</Label>
          </div>
        </RadioGroup>

        {inputType === 'single' ? (
          <div className="space-y-2">
            <Label htmlFor="url">Enter URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              {...form.register('url')}
            />
            {form.formState.errors.url && (
              <p className="text-sm text-red-500">{form.formState.errors.url.message}</p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="urls">Enter URLs (one per line)</Label>
            <textarea
              id="urls"
              className="w-full min-h-[100px] p-2 border rounded-md"
              placeholder="https://example1.com&#10;https://example2.com"
              {...form.register('url')}
            />
            {form.formState.errors.url && (
              <p className="text-sm text-red-500">{form.formState.errors.url.message}</p>
            )}
          </div>
        )}
      </div>

      <Button type="submit">Generate QR Code</Button>
    </form>
  );
}
