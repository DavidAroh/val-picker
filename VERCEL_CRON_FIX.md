# Vercel Cron Expression Fix

## ✅ Fixed!

The cron expression has been updated to use Vercel's 5-field format.

## What Changed

### Before (❌ Invalid):
```json
"schedule": "0 0 8 14 2 *"
```
- 6 fields (standard cron format)
- Vercel doesn't support the year field

### After (✅ Valid):
```json
"schedule": "0 8 14 2 *"
```
- 5 fields (Vercel format)
- Runs at 8:00 AM on February 14th

## Vercel Cron Format

Vercel uses the standard 5-field cron format:

```
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of week (0 - 6) (Sunday to Saturday)
│ │ │ │ │
│ │ │ │ │
* * * * *
```

### Our Schedule:
```
0 8 14 2 *
│ │ │  │ │
│ │ │  │ └─── Any day of week
│ │ │  └───── February (month 2)
│ │ └──────── 14th day
│ └─────────── 8 AM (hour 8)
└───────────── 0 minutes
```

**Meaning**: Runs at **8:00 AM on February 14th** every year

## Testing

You can now deploy to Vercel without errors! The cron job will:
- ✅ Run automatically on Valentine's Day
- ✅ Send draw day emails to all users
- ✅ Trigger at 8:00 AM UTC

## Common Vercel Cron Examples

```json
// Every day at midnight
"schedule": "0 0 * * *"

// Every hour
"schedule": "0 * * * *"

// Every Monday at 9 AM
"schedule": "0 9 * * 1"

// First day of every month at noon
"schedule": "0 12 1 * *"

// Every 15 minutes
"schedule": "*/15 * * * *"
```

## Deployment

Now you can deploy to Vercel:
```bash
vercel --prod
```

The cron job will be automatically configured! 🎉
