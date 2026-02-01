
# Fix Build Errors: Remove Firebase Dependencies and Complete Supabase Migration

## Problem Summary

The project is failing to build because several files are still importing from `@/firebase`, which no longer exists. You've migrated to Supabase, but three files still contain Firebase code that needs to be updated.

## Files That Need to Be Fixed

### 1. `src/components/GoogleMaps.tsx`
- **Problem**: Imports Firebase modules and uses Firestore for geospatial queries
- **Fix**: Remove Firebase imports and refactor to use Supabase for data fetching

### 2. `src/hooks/useSearchEngine.ts`  
- **Problem**: Imports from `@/firebase` and uses Firestore to fetch businesses
- **Fix**: Replace with Supabase queries using the existing `supabaseClient`

### 3. `src/pages/BusinessDetail.tsx`
- **Problem**: Uses Firebase Firestore to fetch business details and related data
- **Fix**: Replace with Supabase queries

### 4. `src/services/businesses.ts`
- **Problem**: TypeScript type errors due to missing `category` and `category_slug` fields in some query results
- **Fix**: Update type definitions and ensure all code paths return consistent data shapes

### 5. `src/pages/DebugEnv.tsx`
- **Problem**: References Firebase-specific environment variables
- **Fix**: Update to show Supabase variables instead (or remove the page if no longer needed)

## Implementation Plan

### Step 1: Update `useSearchEngine.ts`
Replace the `useFirestoreBusinesses` hook with a Supabase-based version:
- Remove Firebase imports
- Use `supabase.from('businesses').select()` to fetch all businesses
- Keep the existing filtering and search logic unchanged

### Step 2: Update `BusinessDetail.tsx`
Replace Firebase data fetching with Supabase:
- Remove Firebase imports
- Fetch business by ID using `supabase.from('businesses').select().eq('id', id).single()`
- Fetch related businesses by category using Supabase queries
- Keep the existing UI and fallback to mock data logic

### Step 3: Update `GoogleMaps.tsx`
This component uses geospatial queries with `geofire-common`. Options:
1. **Simple approach**: Fetch all businesses and filter client-side by distance
2. **Advanced approach**: Use PostGIS functions if available in your Supabase database

We'll use the simple approach for now since it matches the current behavior.

### Step 4: Fix `businesses.ts` Type Errors
The function `getBusinessesByCategorySlug` has type mismatches. The fix involves:
- Removing the strict return type annotation or making it more flexible
- Ensuring all fallback query paths return the same shape

### Step 5: Update `DebugEnv.tsx`
Update to show Supabase environment variables instead of Firebase ones.

### Step 6: Cleanup
- Delete `src/firebase_old.ts` (optional, but recommended)
- The `firebase` package can remain installed for now (won't cause build errors)

---

## Technical Details

### Supabase Query Examples

**Fetch all businesses:**
```typescript
const { data, error } = await supabase
  .from('businesses')
  .select('*');
```

**Fetch single business by ID:**
```typescript
const { data, error } = await supabase
  .from('businesses')
  .select('*')
  .eq('id', id)
  .maybeSingle();
```

**Fetch related businesses by category:**
```typescript
const { data, error } = await supabase
  .from('businesses')
  .select('*')
  .eq('category_slug', categorySlug)
  .neq('id', currentId)
  .limit(6);
```

### Data Normalization
The existing `normalizeBusinessData()` function in `src/lib/dataNormalization.ts` handles mapping Supabase snake_case fields to camelCase, so we'll continue using it.

### Expected Outcome
After these changes:
- The build will succeed
- All business data will be fetched from Supabase
- The app will continue to work the same way from the user's perspective
