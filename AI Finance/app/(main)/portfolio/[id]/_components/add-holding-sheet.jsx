"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Plus, Search, TrendingUp } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { holdingSchema } from "@/lib/portfolio-schema";
import { addHolding, searchAssets } from "@/actions/portfolio";
import useFetch from "@/hooks/use-fetch";
import { POPULAR_STOCKS, POPULAR_CRYPTO } from "@/lib/market-data";

export default function AddHoldingSheet({ portfolioId }) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(holdingSchema),
    mode: "onChange",
    defaultValues: {
      symbol: "",
      name: "",
      assetType: "STOCK",
      quantity: "",
      averageBuyPrice: "",
      sector: "",
    },
  });

  const {
    data: newHolding,
    loading: isLoading,
    error,
    fn: addFn,
  } = useFetch(addHolding);

  const watchedType = watch("assetType");
  const watchedSymbol = watch("symbol");
  const watchedName = watch("name");

  useEffect(() => {
    if (searchQuery.length < 1 || watchedType === "MANUAL") {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchAssets(searchQuery, watchedType);
      setSearchResults(results);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, watchedType]);

  const handleSelectAsset = (asset) => {
    setSelectedAsset(asset);
    setValue("symbol", asset.symbol);
    setValue("name", asset.name);
    if (asset.sector) {
      setValue("sector", asset.sector);
    }
    setSearchQuery(`${asset.symbol} - ${asset.name}`);
    setSearchResults([]);
  };

  const onSubmit = (data) => {
    addFn(portfolioId, data);
  };

  useEffect(() => {
    if (newHolding && !isLoading) {
      toast.success(`${watchedSymbol} added to portfolio`);
      reset();
      setSelectedAsset(null);
      setSearchQuery("");
      setOpen(false);
    }
  }, [newHolding, isLoading, reset, watchedSymbol]);

  useEffect(() => {
    if (error) {
      toast.error(error.message);
    }
  }, [error]);

  return (
    <div className="fixed bottom-6 right-24 z-40">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button className="rounded-full h-14 w-14 shadow-lg text-white" style={{ background: "linear-gradient(to right, #2563eb, #9333ea)" }}>
            <Plus className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Add Holding</SheetTitle>
          </SheetHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-6">
            <div className="space-y-2">
              <Label>Asset Type</Label>
              <Select
                value={watchedType}
                onValueChange={(v) => {
                  setValue("assetType", v);
                  if (v !== "MANUAL") {
                    setSearchQuery("");
                    setSelectedAsset(null);
                    setValue("symbol", "");
                    setValue("name", "");
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STOCK">Stock</SelectItem>
                  <SelectItem value="ETF">ETF</SelectItem>
                  <SelectItem value="CRYPTO">Crypto</SelectItem>
                  <SelectItem value="MUTUAL_FUND">Mutual Fund</SelectItem>
                  <SelectItem value="MANUAL">Manual (Real Estate, Gold, etc.)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {watchedType === "MANUAL" ? (
              <div className="space-y-4 border p-4 rounded-lg bg-muted/20">
                <div className="space-y-2">
                  <Label>Asset Name</Label>
                  <Input 
                    placeholder="e.g., Physical Gold" 
                    {...register("name")}
                  />
                  {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Symbol/Code</Label>
                  <Input 
                    placeholder="e.g., GOLD" 
                    {...register("symbol")}
                  />
                  {errors.symbol && <p className="text-xs text-red-500">{errors.symbol.message}</p>}
                </div>
              </div>
            ) : (
              <div className="space-y-2 relative">
                <Label>Search Asset</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by symbol or name..."
                  />
                </div>

                {isSearching && (
                  <div className="absolute z-10 bg-white border rounded-lg shadow-lg w-full mt-1 p-3 text-center text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin mx-auto inline" /> Searching...
                  </div>
                )}

                {searchResults.length > 0 && !isSearching && (
                  <div className="absolute z-10 bg-white border rounded-lg shadow-lg w-full mt-1 max-h-48 overflow-y-auto">
                    {searchResults.map((asset) => (
                      <button
                        key={asset.symbol}
                        type="button"
                        className="w-full text-left px-3 py-2 hover:bg-muted flex justify-between items-center"
                        onClick={() => handleSelectAsset(asset)}
                      >
                        <div>
                          <span className="font-bold">{asset.symbol}</span>{" "}
                          <span className="text-sm text-muted-foreground">
                            {asset.name}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {asset.assetType}
                        </Badge>
                      </button>
                    ))}
                  </div>
                )}

                {searchQuery.length === 0 && (watchedType === "STOCK" || watchedType === "CRYPTO") && (
                  <div className="border rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-2">
                      Popular {watchedType.toLowerCase()}s:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {watchedType === "CRYPTO"
                        ? POPULAR_CRYPTO.slice(0, 6).map((c) => (
                            <Badge
                              key={c.symbol}
                              variant="outline"
                              className="cursor-pointer hover:bg-muted"
                              onClick={() => handleSelectAsset({ ...c, assetType: "CRYPTO" })}
                            >
                              {c.symbol}
                            </Badge>
                          ))
                        : POPULAR_STOCKS.slice(0, 6).map((s) => (
                            <Badge
                              key={s.symbol}
                              variant="outline"
                              className="cursor-pointer hover:bg-muted"
                              onClick={() => handleSelectAsset({ ...s, assetType: "STOCK" })}
                            >
                              {s.symbol}
                            </Badge>
                          ))}
                    </div>
                  </div>
                )}
                
                {errors.symbol && <p className="text-xs text-red-500 mt-1">Please select an asset from the search results</p>}
              </div>
            )}

            {selectedAsset && watchedType !== "MANUAL" && (
              <div className="p-3 bg-blue-50 border-blue-100 rounded-lg flex items-center justify-between border">
                <div>
                  <p className="font-bold text-blue-900">{selectedAsset.symbol}</p>
                  <p className="text-sm text-blue-700">{selectedAsset.name}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                  onClick={() => {
                    setSelectedAsset(null);
                    setSearchQuery("");
                    setValue("symbol", "");
                    setValue("name", "");
                  }}
                >
                  Clear
                </Button>
              </div>
            )}

            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input
                type="number"
                step="any"
                min="0.000001"
                placeholder="e.g., 10"
                {...register("quantity")}
              />
              {errors.quantity && (
                <p className="text-sm text-red-500">{errors.quantity.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Average Buy Price (USD)</Label>
              <Input
                type="number"
                step="any"
                min="0"
                placeholder="e.g., 150.00"
                {...register("averageBuyPrice")}
              />
              <p className="text-xs text-muted-foreground">
                Enter the average price you paid per unit
              </p>
              {errors.averageBuyPrice && (
                <p className="text-sm text-red-500">
                  {errors.averageBuyPrice.message}
                </p>
              )}
            </div>

            {watchedType === "STOCK" && (
              <div className="space-y-2">
                <Label>Sector (Optional)</Label>
                <Select onValueChange={(v) => setValue("sector", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sector" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Financial">Financial</SelectItem>
                    <SelectItem value="Consumer Cyclical">Consumer Cyclical</SelectItem>
                    <SelectItem value="Consumer Defensive">Consumer Defensive</SelectItem>
                    <SelectItem value="Energy">Energy</SelectItem>
                    <SelectItem value="Utilities">Utilities</SelectItem>
                    <SelectItem value="Real Estate">Real Estate</SelectItem>
                    <SelectItem value="Communication">Communication</SelectItem>
                    <SelectItem value="Industrial">Industrial</SelectItem>
                    <SelectItem value="Materials">Materials</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {!watchedType === "MANUAL" && (
              <>
                <input type="hidden" {...register("symbol")} />
                <input type="hidden" {...register("name")} />
              </>
            )}

            <div className="flex gap-3 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || !isValid}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Holding"
                )}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
