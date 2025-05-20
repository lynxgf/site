import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  items: FaqItem[];
  className?: string;
}

export function FaqAccordion({ items, className = "" }: FaqAccordionProps) {
  return (
    <Accordion type="single" collapsible className={`w-full ${className}`}>
      {items.map((item) => (
        <AccordionItem key={item.id} value={item.id} className="border-b border-gray-200">
          <AccordionTrigger className="text-lg font-medium hover:text-[#8e2b85] transition-colors">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="text-gray-600">
            <div dangerouslySetInnerHTML={{ __html: item.answer }} />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}