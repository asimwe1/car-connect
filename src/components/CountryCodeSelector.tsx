import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { countryCodes, popularCountries, CountryCode, getCountryByCode } from '@/data/countryCodes';

interface CountryCodeSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export const CountryCodeSelector: React.FC<CountryCodeSelectorProps> = ({
  value,
  onValueChange,
  disabled = false,
  className
}) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const selectedCountry = getCountryByCode(value);

  // Get popular countries first, then the rest
  const popularCountryObjects = popularCountries
    .map(code => getCountryByCode(code))
    .filter(Boolean) as CountryCode[];
  
  const otherCountries = countryCodes.filter(
    country => !popularCountries.includes(country.code)
  );

  const filteredPopular = popularCountryObjects.filter(country =>
    country.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    country.dialCode.includes(searchValue) ||
    country.code.toLowerCase().includes(searchValue.toLowerCase())
  );

  const filteredOthers = otherCountries.filter(country =>
    country.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    country.dialCode.includes(searchValue) ||
    country.code.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-[140px] justify-between", className)}
          disabled={disabled}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">{selectedCountry?.flag || '🌍'}</span>
            <span className="text-sm font-mono">
              {selectedCountry?.dialCode || '+1'}
            </span>
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput 
            placeholder="Search countries..." 
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandEmpty>No country found.</CommandEmpty>
          
          {filteredPopular.length > 0 && (
            <CommandGroup heading="Popular">
              {filteredPopular.map((country) => (
                <CommandItem
                  key={country.code}
                  value={country.code}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-lg">{country.flag}</span>
                    <div className="flex-1">
                      <div className="font-medium">{country.name}</div>
                      <div className="text-sm text-muted-foreground font-mono">
                        {country.dialCode}
                      </div>
                    </div>
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === country.code ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          
          {filteredOthers.length > 0 && (
            <CommandGroup heading="All Countries">
              {filteredOthers.map((country) => (
                <CommandItem
                  key={country.code}
                  value={country.code}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-lg">{country.flag}</span>
                    <div className="flex-1">
                      <div className="font-medium">{country.name}</div>
                      <div className="text-sm text-muted-foreground font-mono">
                        {country.dialCode}
                      </div>
                    </div>
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === country.code ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
};
