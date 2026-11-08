from app.schemas import RiskResult


def decide(risk: RiskResult) -> tuple[str, str]:
    # The risk level is authoritative; never use the engine's action string to
    # weaken the team's fixed LOW/ MEDIUM/ HIGH policy.
    if risk.level == "LOW":
        return "APPROVE", "Low risk: payment may proceed to PayPal Sandbox."
    if risk.level == "MEDIUM":
        return "REVIEW", "Medium risk: manual review required; payment is not created."
    return "BLOCK", "High risk: payment blocked by server policy."

