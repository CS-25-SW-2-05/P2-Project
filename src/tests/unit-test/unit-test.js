export default class UnitTest {
    static derived = new Set();

    run() {
        throw new Error(
            `Method '${this.run.name}' must be implemented by subclass.`,
        );
    }
}

// Helper function for creating buildings object
export function createBuildings(buildingsInput) {
    const buildings = {};

    // Loop through each building name (key)
    for (const key in buildingsInput) {
        const building = buildingsInput[key];

        // Create a building object
        buildings[key] = {
            // Use the key as the name
            name: key,
            // Set cost
            cost: building.cost,
            // Optional CPS (default = 0)
            baseCpS: building.baseCpS ?? 0,
            // Required by PurchaseDecision
            canPurchase: building.canPurchase ?? (() => true),
        };
    }

    return buildings;
}
