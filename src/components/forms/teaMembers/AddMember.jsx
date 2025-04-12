import React, { useState, useEffect } from 'react';

const TeamForm = () => {
  // Team details state
  const [teamName, setTeamName] = useState('');
  const [matricule, setMatricule] = useState('');
  
  // Leader id from localStorage
  const leaderId = localStorage.getItem('leader_id') || 4; // Default leader ID if not in localStorage
  // State for team members array - each with member details
  const [members, setMembers] = useState([{
    memberId: '',
    memberName: '',
    memberEmail: '',
    memberPhone: '',
    leaderId: leaderId
  }]);
  
  // Loading and error states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // On component mount, retrieve the leader id from localStorage
  useEffect(() => {
    const storedLeaderId = localStorage.getItem('leader_id');
    if (storedLeaderId) {
      setLeaderId(storedLeaderId);
    } else {
      // Default leader ID if not in localStorage
    }
  }, []);

  // Handle changes for team member fields
  const handleMemberChange = (index, field, value) => {
    const newMembers = [...members];
    newMembers[index][field] = value;
    setMembers(newMembers);
  };

  // Adds a new team member object
  const addMemberField = () => {
    setMembers([...members, {
      memberId: '',
      memberName: '',
      memberEmail: '',
      memberPhone: ''
    }]);
  };

  // Removes a member field at a given index
  const removeMemberField = (index) => {
    const newMembers = members.filter((_, i) => i !== index);
    setMembers(newMembers);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);
    
    // Filter out empty member entries
    const validMembers = members.filter(
      (member) => member.memberId.trim() !== '' || member.memberName.trim() !== ''
    );
    
    try {
      // Submit each member with the team info
      for (const member of validMembers) {
        const memberData = {
          matricule: matricule,
          fullname: member.memberName,
          email: member.memberEmail,
          phone: member.memberPhone,
          leader_id: leaderId
        };
        
        const response = await fetch('https://5138-41-111-220-41.ngrok-free.app/api/add-team', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(memberData),
        });
        
        if (!response.ok) {
          throw new Error(`Error adding team member: ${response.statusText}`);
        }
      }
      
      // All members added successfully
      setSubmitSuccess(true);
      
      // Reset form after successful submission
      setTeamName('');
      setMatricule('');
      setMembers([{
        memberId: '',
        memberName: '',
        memberEmail: '',
        memberPhone: ''
      }]);
      
    } catch (error) {
      console.error('Error submitting team data:', error);
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Inline styles for enhanced UI
  const cardStyle = {
    maxWidth: '800px',
    margin: '2rem auto',
    padding: '2rem',
    border: '1px solid #ccc',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    fontFamily: 'Arial, sans-serif',
  };

  const sectionStyle = {
    marginBottom: '1.5rem',
  };

  const inputStyle = {
    width: '100%',
    padding: '0.5rem',
    marginBottom: '0.5rem',
    borderRadius: '4px',
    border: '1px solid #ccc',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '0.3rem',
    fontWeight: 'bold',
  };

  const buttonStyle = {
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    marginRight: '0.5rem',
  };

  const addButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#28a745',
    color: '#fff',
  };

  const removeButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#dc3545',
    color: '#fff',
  };

  const submitButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#007bff',
    color: '#fff',
  };

  const memberCardStyle = {
    border: '1px solid #eee',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '1rem',
    backgroundColor: '#f9f9f9',
  };

  const memberHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    borderBottom: '1px solid #eee',
    paddingBottom: '0.5rem',
  };

  const twoColumnStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
  };

  const columnStyle = {
    flex: '1 1 45%',
    minWidth: '200px',
  };
  
  const alertStyle = {
    padding: '0.75rem 1.25rem',
    marginBottom: '1rem',
    borderRadius: '0.25rem',
  };
  
  const successAlertStyle = {
    ...alertStyle,
    backgroundColor: '#d4edda',
    color: '#155724',
    border: '1px solid #c3e6cb',
  };
  
  const errorAlertStyle = {
    ...alertStyle,
    backgroundColor: '#f8d7da',
    color: '#721c24',
    border: '1px solid #f5c6cb',
  };

  return (
    <form style={cardStyle} onSubmit={handleSubmit}>
      <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>
        Create New Team
      </h2>

      {/* Team Details Section */}
      <div style={sectionStyle}>
        <h3>Team Details</h3>
        
        <div style={twoColumnStyle}>
          <div style={columnStyle}>
            <label style={labelStyle} htmlFor="teamName">
              Team Name:
            </label>
            <input
              style={inputStyle}
              type="text"
              id="teamName"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Enter team name"
              required
            />
          </div>
          
          <div style={columnStyle}>
            <label style={labelStyle} htmlFor="matricule">
              Matricule:
            </label>
            <input
              style={inputStyle}
              type="text"
              id="matricule"
              value={matricule}
              onChange={(e) => setMatricule(e.target.value)}
              placeholder="Enter matricule"
              required
            />
          </div>
        </div>
      </div>
      
      {/* Status messages */}
      {submitSuccess && (
        <div style={successAlertStyle}>
          Team members added successfully!
        </div>
      )}
      
      {submitError && (
        <div style={errorAlertStyle}>
          Error: {submitError}
        </div>
      )}
    
      {/* Team Members Section */}
      <div style={sectionStyle}>
        <h3>Team Members</h3>
        
        {members.map((member, index) => (
          <div key={index} style={memberCardStyle}>
            <div style={memberHeaderStyle}>
              <h4 style={{ margin: 0 }}>Member {index + 1}</h4>
              {members.length > 1 && (
                <button
                  type="button"
                  style={removeButtonStyle}
                  onClick={() => removeMemberField(index)}
                >
                  Remove
                </button>
              )}
            </div>
            
            <div style={twoColumnStyle}>
              <div style={columnStyle}>
                <label style={labelStyle} htmlFor={`memberId-${index}`}>
                  Member ID:
                </label>
                <input
                  style={inputStyle}
                  type="text"
                  id={`memberId-${index}`}
                  value={member.memberId}
                  onChange={(e) =>
                    handleMemberChange(index, 'memberId', e.target.value)
                  }
                  placeholder="Enter member ID"
                  required
                />
              </div>
              
              <div style={columnStyle}>
                <label style={labelStyle} htmlFor={`memberName-${index}`}>
                  Full Name:
                </label>
                <input
                  style={inputStyle}
                  type="text"
                  id={`memberName-${index}`}
                  value={member.memberName}
                  onChange={(e) =>
                    handleMemberChange(index, 'memberName', e.target.value)
                  }
                  placeholder="Enter member name"
                  required
                />
              </div>
              
              <div style={columnStyle}>
                <label style={labelStyle} htmlFor={`memberEmail-${index}`}>
                  Email:
                </label>
                <input
                  style={inputStyle}
                  type="email"
                  id={`memberEmail-${index}`}
                  value={member.memberEmail}
                  onChange={(e) =>
                    handleMemberChange(index, 'memberEmail', e.target.value)
                  }
                  placeholder="Enter member email"
                  required
                />
              </div>
              
              <div style={columnStyle}>
                <label style={labelStyle} htmlFor={`memberPhone-${index}`}>
                  Phone:
                </label>
                <input
                  style={inputStyle}
                  type="tel"
                  id={`memberPhone-${index}`}
                  value={member.memberPhone}
                  onChange={(e) =>
                    handleMemberChange(index, 'memberPhone', e.target.value)
                  }
                  placeholder="Enter member phone"
                  required
                />
              </div>
            </div>
          </div>
        ))}
        
        <button type="button" style={addButtonStyle} onClick={addMemberField}>
          Add Member
        </button>
      </div>

      <div style={{ textAlign: 'center' }}>
        <button 
          type="submit" 
          style={{
            ...submitButtonStyle,
            opacity: isSubmitting ? 0.7 : 1,
            cursor: isSubmitting ? 'not-allowed' : 'pointer'
          }}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </form>
  );
};

export default TeamForm;