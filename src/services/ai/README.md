AI CSV Cleaner (AgentRouter)

This module provides a simple wrapper to clean and normalize a CSV using an OpenAI-compatible API via AgentRouter.

Setup (.env with Vite)

- VITE_OPENAI_API_KEY=sk-xxx
- VITE_OPENAI_BASE_URL=https://agentrouter.org/v1  # optional
- VITE_OPENAI_MODEL=gpt-5                          # optional

Usage

import { cleanCsvWithAI } from '@/services/ai/agentCleaner';

const csv = `ID,Name,Age,DateOfBirth,Salary,Bonus
1,John Doe,28,1997-05-14,1234.56,300
...`;

const { cleanedCsv } = await cleanCsvWithAI(csv, {
  thousandsSeparator: ',',
  decimalSeparator: '.',
  dateFormat: 'DD/MM/YYYY',
  schema: {
    ID: 'integer',
    Name: 'text',
    Age: 'integer',
    DateOfBirth: 'date',
    Salary: 'float',
    Bonus: 'float',
  },
});

console.log(cleanedCsv);

Notes

- Consider proxying through your backend for production to avoid CORS and to keep your API key secure.
- Temperature is set to 0 for deterministic cleanup.
