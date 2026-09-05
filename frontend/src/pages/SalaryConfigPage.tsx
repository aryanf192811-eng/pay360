import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Plus, Pencil } from 'lucide-react';
import {
  listSalaryStructures, getSalaryStructure, createSalaryStructure, updateSalaryStructure,
  createSalaryRule, updateSalaryRule, type SalaryRule,
} from '../api/salary.api';
import { useAuthStore, PAYROLL_WRITE_ROLES } from '../store/auth.store';
import { EmptyState } from '../components/EmptyState';
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/ui/table';
import { Button } from '../components/ui/button';
import { Input, Label, Select } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

const EMPTY_RULE_FORM = {
  name: '', code: '', category: 'allowance', sequence: '10',
  computation_method: 'fixed', amount: '', percentage: '', base_code: '', formula: '',
};

function ruleToForm(r: SalaryRule) {
  return {
    name: r.name, code: r.code, category: r.category, sequence: String(r.sequence),
    computation_method: r.computation_method,
    amount: r.amount != null ? String(r.amount) : '',
    percentage: r.percentage != null ? String(r.percentage) : '',
    base_code: r.base_code || '', formula: r.formula || '',
  };
}

export function SalaryConfigPage() {
  const { user } = useAuthStore();
  const canWrite = !!user && PAYROLL_WRITE_ROLES.includes(user.role);
  const queryClient = useQueryClient();
  const [selectedStructureId, setSelectedStructureId] = useState<string | null>(null);
  const [showStructForm, setShowStructForm] = useState(false);
  const [structName, setStructName] = useState('');
  const [editingStructureId, setEditingStructureId] = useState<string | null>(null);
  const [structRenameValue, setStructRenameValue] = useState('');
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [ruleForm, setRuleForm] = useState(EMPTY_RULE_FORM);

  const { data: structures } = useQuery({ queryKey: ['salary-structures'], queryFn: listSalaryStructures });
  const { data: structureDetail } = useQuery({
    queryKey: ['salary-structure', selectedStructureId],
    queryFn: () => getSalaryStructure(selectedStructureId!),
    enabled: !!selectedStructureId,
  });

  const createStructMut = useMutation({
    mutationFn: () => createSalaryStructure(structName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-structures'] });
      setShowStructForm(false);
      setStructName('');
    },
  });

  const updateStructMut = useMutation({
    mutationFn: (payload: { id: string; name?: string; active?: boolean }) => updateSalaryStructure(payload.id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-structures'] });
      queryClient.invalidateQueries({ queryKey: ['salary-structure', selectedStructureId] });
      setEditingStructureId(null);
    },
  });

  function resetRuleForm() {
    setShowRuleForm(false);
    setEditingRuleId(null);
    setRuleForm(EMPTY_RULE_FORM);
  }

  const ruleMutationPayload = () => ({
    structure_id: selectedStructureId!,
    name: ruleForm.name,
    code: ruleForm.code,
    category: ruleForm.category as never,
    sequence: Number(ruleForm.sequence),
    computation_method: ruleForm.computation_method as never,
    amount: ruleForm.amount ? Number(ruleForm.amount) : null,
    percentage: ruleForm.percentage ? Number(ruleForm.percentage) : null,
    base_code: ruleForm.base_code || null,
    formula: ruleForm.formula || null,
  });

  const createRuleMut = useMutation({
    mutationFn: () => createSalaryRule(ruleMutationPayload()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-structure', selectedStructureId] });
      queryClient.invalidateQueries({ queryKey: ['salary-structures'] });
      resetRuleForm();
    },
  });

  const updateRuleMut = useMutation({
    mutationFn: () => updateSalaryRule(editingRuleId!, ruleMutationPayload()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-structure', selectedStructureId] });
      resetRuleForm();
    },
  });

  // Deactivating never deletes a rule's history — past payslip_lines already computed from it
  // are frozen (CLAUDE.md: "changing a rule changes future payslips, never past ones"). This is
  // just an is-it-used-going-forward flag on the same row.
  const toggleRuleActiveMut = useMutation({
    mutationFn: (rule: SalaryRule) => updateSalaryRule(rule.id, { active: !rule.active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['salary-structure', selectedStructureId] }),
  });

  function startEditRule(r: SalaryRule) {
    setEditingRuleId(r.id);
    setRuleForm(ruleToForm(r));
    setShowRuleForm(true);
  }

  function startAddRule() {
    setEditingRuleId(null);
    setRuleForm(EMPTY_RULE_FORM);
    setShowRuleForm(true);
  }

  return (
    <div className="space-y-24">
      <div>
        <h1 className="text-2xl font-bold text-text">Salary Configuration</h1>
        <p className="text-sm text-text-muted">Structures are ordered collections of Salary Rules that drive payslip generation.</p>
      </div>

      <div className="grid grid-cols-3 gap-24">
        <Card className="col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Structures</CardTitle>
            {canWrite && (
              <Button size="sm" variant="ghost" onClick={() => setShowStructForm((v) => !v)}>
                <Plus className="h-[14px] w-[14px]" />
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-8">
            {showStructForm && (
              <form
                className="flex gap-8"
                onSubmit={(e) => { e.preventDefault(); createStructMut.mutate(); }}
              >
                <Input value={structName} onChange={(e) => setStructName(e.target.value)} placeholder="Structure name" required />
                <Button type="submit" size="sm" disabled={createStructMut.isPending}>Add</Button>
              </form>
            )}
            {structures?.length === 0 && <div className="text-sm text-text-muted">No structures yet.</div>}
            {structures?.map((s) => (
              <div
                key={s.id}
                className={`w-full rounded-md px-12 py-8 text-sm transition-colors ${
                  selectedStructureId === s.id ? 'bg-primary text-white' : 'hover:bg-bg text-text'
                }`}
              >
                {editingStructureId === s.id ? (
                  <form
                    className="flex items-center gap-4"
                    onClick={(e) => e.stopPropagation()}
                    onSubmit={(e) => {
                      e.preventDefault();
                      updateStructMut.mutate({ id: s.id, name: structRenameValue });
                    }}
                  >
                    <Input
                      autoFocus
                      value={structRenameValue}
                      onChange={(e) => setStructRenameValue(e.target.value)}
                      className="h-[28px] bg-surface text-text"
                    />
                    <Button type="submit" size="sm" variant="secondary" disabled={updateStructMut.isPending}>Save</Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => setEditingStructureId(null)}>✕</Button>
                  </form>
                ) : (
                  <button onClick={() => setSelectedStructureId(s.id)} className="w-full text-left">
                    <div className="flex items-center justify-between gap-8">
                      <div className="flex items-center gap-4 font-medium">
                        {s.name}
                        {canWrite && (
                          <span
                            role="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingStructureId(s.id);
                              setStructRenameValue(s.name);
                            }}
                            className={`rounded p-2 ${selectedStructureId === s.id ? 'hover:bg-white/20' : 'hover:bg-border'}`}
                          >
                            <Pencil className="h-[12px] w-[12px]" />
                          </span>
                        )}
                      </div>
                      <Badge
                        tone={s.active ? 'success' : 'neutral'}
                        {...(canWrite
                          ? {
                              role: 'button',
                              onClick: (e: React.MouseEvent) => {
                                e.stopPropagation();
                                updateStructMut.mutate({ id: s.id, active: !s.active });
                              },
                            }
                          : {})}
                      >
                        {s.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className={`text-xs ${selectedStructureId === s.id ? 'text-white/80' : 'text-text-muted'}`}>
                      {s.rule_count} rules · {s.active_employee_count} employees
                    </div>
                  </button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>{structureDetail ? `${structureDetail.name} — Rules` : 'Select a structure'}</CardTitle>
            {canWrite && structureDetail && (
              <Button size="sm" onClick={startAddRule}>
                <Plus className="h-[14px] w-[14px]" /> Rule
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {!structureDetail ? (
              <EmptyState icon={Settings} title="No structure selected" description="Choose a salary structure on the left to view and manage its rules." />
            ) : (
              <div className="space-y-16">
                {showRuleForm && (
                  <form
                    className="grid grid-cols-3 gap-12 rounded-md border border-border p-16"
                    onSubmit={(e) => {
                      e.preventDefault();
                      editingRuleId ? updateRuleMut.mutate() : createRuleMut.mutate();
                    }}
                  >
                    <div className="space-y-4"><Label>Name</Label><Input required value={ruleForm.name} onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })} /></div>
                    <div className="space-y-4"><Label>Code</Label><Input required value={ruleForm.code} onChange={(e) => setRuleForm({ ...ruleForm, code: e.target.value.toUpperCase() })} /></div>
                    <div className="space-y-4"><Label>Sequence</Label><Input type="number" required value={ruleForm.sequence} onChange={(e) => setRuleForm({ ...ruleForm, sequence: e.target.value })} /></div>
                    <div className="space-y-4">
                      <Label>Category</Label>
                      <Select value={ruleForm.category} onChange={(e) => setRuleForm({ ...ruleForm, category: e.target.value })}>
                        <option value="basic">Basic</option><option value="allowance">Allowance</option>
                        <option value="gross">Gross</option><option value="deduction">Deduction</option><option value="net">Net</option>
                      </Select>
                    </div>
                    <div className="space-y-4">
                      <Label>Method</Label>
                      <Select value={ruleForm.computation_method} onChange={(e) => setRuleForm({ ...ruleForm, computation_method: e.target.value })}>
                        <option value="fixed">Fixed</option><option value="percentage">Percentage</option><option value="formula">Formula</option>
                      </Select>
                    </div>
                    {ruleForm.computation_method === 'fixed' && (
                      <div className="space-y-4"><Label>Amount</Label><Input type="number" value={ruleForm.amount} onChange={(e) => setRuleForm({ ...ruleForm, amount: e.target.value })} /></div>
                    )}
                    {ruleForm.computation_method === 'percentage' && (
                      <>
                        <div className="space-y-4"><Label>Percentage</Label><Input type="number" value={ruleForm.percentage} onChange={(e) => setRuleForm({ ...ruleForm, percentage: e.target.value })} /></div>
                        <div className="space-y-4"><Label>Base Code</Label><Input value={ruleForm.base_code} onChange={(e) => setRuleForm({ ...ruleForm, base_code: e.target.value.toUpperCase() })} placeholder="BASIC" /></div>
                      </>
                    )}
                    {ruleForm.computation_method === 'formula' && (
                      <div className="col-span-2 space-y-4"><Label>Formula</Label><Input value={ruleForm.formula} onChange={(e) => setRuleForm({ ...ruleForm, formula: e.target.value })} placeholder="GROSS - PF" /></div>
                    )}
                    <div className="col-span-3 flex justify-end gap-8">
                      <Button type="button" variant="secondary" onClick={resetRuleForm}>Cancel</Button>
                      <Button type="submit" disabled={createRuleMut.isPending || updateRuleMut.isPending}>
                        {editingRuleId ? (updateRuleMut.isPending ? 'Saving…' : 'Save Changes') : (createRuleMut.isPending ? 'Adding…' : 'Add Rule')}
                      </Button>
                    </div>
                  </form>
                )}
                <Table>
                  <Thead><tr><Th>Seq</Th><Th>Name</Th><Th>Code</Th><Th>Category</Th><Th>Computation</Th><Th>Status</Th>{canWrite && <Th></Th>}</tr></Thead>
                  <Tbody>
                    {structureDetail.rules.map((r) => (
                      <Tr key={r.id} className={r.active ? '' : 'opacity-50'}>
                        <Td className="font-mono">{r.sequence}</Td>
                        <Td className="font-medium">{r.name}</Td>
                        <Td className="font-mono text-xs">{r.code}</Td>
                        <Td><Badge tone="primary">{r.category}</Badge></Td>
                        <Td className="font-mono text-xs text-text-muted">
                          {r.computation_method === 'fixed' && `= ${r.amount}`}
                          {r.computation_method === 'percentage' && `${r.percentage}% of ${r.base_code}`}
                          {r.computation_method === 'formula' && r.formula}
                        </Td>
                        <Td>
                          <Badge
                            tone={r.active ? 'success' : 'neutral'}
                            {...(canWrite ? { role: 'button', onClick: () => toggleRuleActiveMut.mutate(r) } : {})}
                          >
                            {r.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </Td>
                        {canWrite && (
                          <Td>
                            <Button size="sm" variant="ghost" onClick={() => startEditRule(r)}>
                              <Pencil className="h-[14px] w-[14px]" />
                            </Button>
                          </Td>
                        )}
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
