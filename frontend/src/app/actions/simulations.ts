'use server'

import db from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function saveSimulation(data: {
    regulatorId: string
    taxRate: number
    subsidy: number
    projectedOutcome: any
}) {
    try {
        const id = 'SIM-' + Date.now()
        const createdAt = new Date().toISOString()

        const stmt = db.prepare('INSERT INTO simulations (id, regulator_id, tax_rate_params, subsidy_params, projected_outcome, created_at) VALUES (?, ?, ?, ?, ?, ?)')
        stmt.run(id, data.regulatorId, data.taxRate, data.subsidy, JSON.stringify(data.projectedOutcome), createdAt)

        revalidatePath('/dashboard/regulator/simulation')
        return { success: true, id }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

export async function getSimulations(regulatorId?: string) {
    try {
        let stmt
        if (regulatorId) {
            stmt = db.prepare('SELECT * FROM simulations WHERE regulator_id = ? ORDER BY created_at DESC')
            return stmt.all(regulatorId) as any[]
        } else {
            stmt = db.prepare('SELECT * FROM simulations ORDER BY created_at DESC')
            return stmt.all() as any[]
        }
    } catch (e: any) {
        return []
    }
}

export async function exportSimulationReport(simulationId: string) {
    try {
        const stmt = db.prepare('SELECT * FROM simulations WHERE id = ?')
        const simulation = stmt.get(simulationId) as any

        if (!simulation) {
            return { success: false, error: 'Simulation not found' }
        }

        const outcome = JSON.parse(simulation.projected_outcome)
        
        let csv = 'Simulation Report\n'
        csv += `ID: ${simulation.id}\n`
        csv += `Tax Rate: ${simulation.tax_rate_params}%\n`
        csv += `Subsidy: Rp ${simulation.subsidy_params.toLocaleString()}\n`
        csv += `Created: ${simulation.created_at}\n\n`
        csv += 'Month,MSME Health,Wealth Index\n'
        
        outcome.forEach((row: any) => {
            csv += `${row.month},${row.msmeHealth},${row.wealthIndex}\n`
        })

        return { success: true, csv }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}
