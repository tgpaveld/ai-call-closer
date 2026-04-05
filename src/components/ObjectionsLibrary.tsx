import { useState } from "react";
import {
  Plus, Search, Edit2, Trash2, TrendingUp, MessageSquare, DollarSign, Clock,
  Shield, Users, HelpCircle, ChevronDown, ChevronUp, Sparkles,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import { Objection, ObjectionCategory, ObjectionResponse } from "@/types/script";
import { allObjections } from "@/data/mockScripts";
import { useLanguage } from "@/contexts/LanguageContext";

const categoryIcons: Record<ObjectionCategory, React.ElementType> = {
  price: DollarSign, timing: Clock, need: HelpCircle, trust: Shield,
  competitor: Users, authority: Users, other: MessageSquare,
};

const categoryColors: Record<ObjectionCategory, string> = {
  price: 'bg-red-500/20 text-red-400 border-red-500/50',
  timing: 'bg-amber-500/20 text-amber-400 border-amber-500/50',
  need: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  trust: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
  competitor: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
  authority: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/50',
  other: 'bg-slate-500/20 text-slate-400 border-slate-500/50',
};

const categoryTransKeys: Record<ObjectionCategory, string> = {
  price: "price", timing: "timing", need: "need", trust: "trust",
  competitor: "competitor", authority: "authority", other: "other",
};

const toneTransKeys: Record<ObjectionResponse['tone'], string> = {
  empathetic: "empathetic", assertive: "assertive", curious: "curious", neutral: "neutral",
};

interface ObjectionCardProps {
  objection: Objection;
  isExpanded: boolean;
  onToggle: () => void;
}

function ObjectionCard({ objection, isExpanded, onToggle }: ObjectionCardProps) {
  const { t } = useLanguage();
  const Icon = categoryIcons[objection.category];
  const color = categoryColors[objection.category];
  const bestResponse = objection.responses.reduce((a, b) => (a.effectiveness || 0) > (b.effectiveness || 0) ? a : b);

  return (
    <Card className={cn("transition-all duration-200", isExpanded && "ring-2 ring-primary/50")}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", color)}><Icon className="w-4 h-4" /></div>
            <div>
              <CardTitle className="text-base">{objection.trigger}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={cn("text-xs", color)}>{t("objections", categoryTransKeys[objection.category])}</Badge>
                <span className="text-xs text-muted-foreground">{objection.usageCount} {t("objections", "uses")}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="flex items-center gap-1 text-success"><TrendingUp className="w-3 h-3" /><span className="text-sm font-medium">{objection.successRate}%</span></div>
              <p className="text-xs text-muted-foreground">{t("objections", "conversionLabel")}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onToggle}>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-2">{t("objections", "keywords")}:</p>
              <div className="flex flex-wrap gap-1">
                {objection.keywords.map((keyword) => (<Badge key={keyword} variant="secondary" className="text-xs">{keyword}</Badge>))}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">{t("objections", "responseVariants")}:</p>
              <div className="space-y-3">
                {objection.responses.map((response) => (
                  <div key={response.id} className={cn("p-3 rounded-lg border bg-secondary/30", response.id === bestResponse.id && "border-success/50 bg-success/5")}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs">{t("objections", toneTransKeys[response.tone])}</span>
                      <div className="flex items-center gap-2">
                        {response.id === bestResponse.id && (<Badge className="text-xs bg-success/20 text-success"><Sparkles className="w-3 h-3 mr-1" />{t("objections", "best")}</Badge>)}
                        {response.effectiveness && (<span className="text-xs text-muted-foreground">{response.effectiveness}% {t("objections", "effectiveness")}</span>)}
                      </div>
                    </div>
                    <p className="text-sm text-foreground">{response.text}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <Button variant="outline" size="sm"><Edit2 className="w-3 h-3 mr-1" />{t("objections", "edit")}</Button>
              <Button variant="outline" size="sm"><Plus className="w-3 h-3 mr-1" />{t("objections", "addResponse")}</Button>
              <Button variant="ghost" size="sm" className="text-destructive ml-auto"><Trash2 className="w-3 h-3 mr-1" />{t("objections", "delete")}</Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export function ObjectionsLibrary() {
  const [objections] = useState<Objection[]>(allObjections);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ObjectionCategory | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { t } = useLanguage();

  const filteredObjections = objections.filter((obj) => {
    const matchesSearch = obj.trigger.toLowerCase().includes(searchQuery.toLowerCase()) || obj.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || obj.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const stats = {
    total: objections.length,
    avgSuccess: Math.round(objections.reduce((a, b) => a + b.successRate, 0) / objections.length),
    totalUsage: objections.reduce((a, b) => a + b.usageCount, 0),
  };

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t("objections", "title")}</h1>
          <p className="text-muted-foreground mt-1">{t("objections", "subtitle")}</p>
        </div>
        <Button><Plus className="w-4 h-4 mr-2" />{t("objections", "addObjection")}</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">{t("objections", "totalObjections")}</p><p className="text-2xl font-bold text-foreground">{stats.total}</p></div><MessageSquare className="w-8 h-8 text-primary opacity-50" /></div></CardContent></Card>
        <Card className="glass"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">{t("objections", "avgConversion")}</p><p className="text-2xl font-bold text-success">{stats.avgSuccess}%</p></div><TrendingUp className="w-8 h-8 text-success opacity-50" /></div></CardContent></Card>
        <Card className="glass"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">{t("objections", "totalUsage")}</p><p className="text-2xl font-bold text-foreground">{stats.totalUsage}</p></div><Sparkles className="w-8 h-8 text-primary opacity-50" /></div></CardContent></Card>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder={t("objections", "searchPlaceholder")} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-secondary" />
        </div>
        <div className="flex items-center gap-2">
          <Button variant={selectedCategory === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setSelectedCategory('all')}>{t("objections", "all")}</Button>
          {(Object.keys(categoryIcons) as ObjectionCategory[]).map((key) => {
            const Icon = categoryIcons[key];
            return (
              <Button key={key} variant={selectedCategory === key ? 'default' : 'outline'} size="sm" onClick={() => setSelectedCategory(key)} className={selectedCategory === key ? '' : categoryColors[key]}>
                <Icon className="w-3 h-3 mr-1" />{t("objections", categoryTransKeys[key])}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        {filteredObjections.length > 0 ? (
          filteredObjections.map((objection) => (
            <ObjectionCard key={objection.id} objection={objection} isExpanded={expandedId === objection.id} onToggle={() => setExpandedId(expandedId === objection.id ? null : objection.id)} />
          ))
        ) : (
          <Card className="glass"><CardContent className="py-12 text-center">
            <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">{t("objections", "notFound")}</p>
            <Button variant="outline" className="mt-4" onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}>{t("objections", "resetFilters")}</Button>
          </CardContent></Card>
        )}
      </div>
    </div>
  );
}
